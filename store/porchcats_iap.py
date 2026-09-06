"""Porch Cats gold fish packs: four CONSUMABLE in-app purchases with USA base price + automatic equalisation,
localisation, availability and a review screenshot. Idempotent.
Run: cd ~/workspace/landed/.credentials && PYTHONPATH=. python3 ~/workspace/porchcats/store/porchcats_iap.py <ASC_APP_ID>"""
import asc, json, sys, time
APP=sys.argv[1]
SHOT='/Users/raymondzhao/workspace/porchcats/store/screenshots/06.png'
PACKS=[('com.formaz.porchcats.gold50','50 Gold Fish',0.99,'A handful of gold fish.'),
       ('com.formaz.porchcats.gold120','120 Gold Fish',1.99,'A bowlful of gold fish.'),
       ('com.formaz.porchcats.gold200','200 Gold Fish',2.99,'A bucket of gold fish.'),
       ('com.formaz.porchcats.gold300','300 Gold Fish',3.99,'The whole catch.')]
def ok(r, what):
    if 'data' in r: return r['data']
    print('FAIL', what, json.dumps(r)[:600]); return None
existing={x['attributes']['productId']:x for x in asc.api('GET',f'/v1/apps/{APP}/inAppPurchasesV2?limit=200')['data']}
terr=[t['id'] for t in asc.api('GET','/v1/territories?limit=200')['data']]
for pid,name,price,desc in PACKS:
    iap=existing.get(pid) or ok(asc.api('POST','/v1/inAppPurchases',{'data':{'type':'inAppPurchases','attributes':{'name':name,'productId':pid,'inAppPurchaseType':'CONSUMABLE','reviewNote':'Consumable gold fish, the premium currency. Credited to the player on purchase; used for premium food and items in the Shop.'},'relationships':{'app':{'data':{'type':'apps','id':APP}}}}}),'create '+pid)
    if not iap: continue
    IID=iap['id']; print('iap', pid, IID, iap['attributes'].get('state'))
    if not asc.api('GET',f'/v1/inAppPurchasesV2/{IID}/inAppPurchaseLocalizations').get('data'):
        ok(asc.api('POST','/v1/inAppPurchaseLocalizations',{'data':{'type':'inAppPurchaseLocalizations','attributes':{'name':name,'description':desc,'locale':'en-US'},'relationships':{'inAppPurchaseV2':{'data':{'type':'inAppPurchases','id':IID}}}}}),'loc')
    av=asc.api('GET',f'/v1/inAppPurchasesV2/{IID}/inAppPurchaseAvailability')
    if 'data' not in av or not av['data']:
        ok(asc.api('POST','/v1/inAppPurchaseAvailabilities',{'data':{'type':'inAppPurchaseAvailabilities','attributes':{'availableInNewTerritories':True},'relationships':{'inAppPurchase':{'data':{'type':'inAppPurchases','id':IID}},'availableTerritories':{'data':[{'type':'territories','id':t} for t in terr]}}}}),'availability')
    sched=asc.api('GET',f'/v1/inAppPurchasesV2/{IID}/iapPriceSchedule')
    if 'data' not in sched or not sched['data']:
        pts=[]; url=f'/v1/inAppPurchasesV2/{IID}/pricePoints?filter[territory]=USA&limit=200&fields[inAppPurchasePricePoints]=customerPrice'
        while url:
            r=asc.api('GET',url); pts+=r.get('data',[]); url=r.get('links',{}).get('next'); url=url.replace('https://api.appstoreconnect.apple.com','') if url else None
        pt=next((p for p in pts if abs(float(p['attributes']['customerPrice'])-price)<0.001),None)
        if not pt: print('  no USA price point for', price); continue
        r=asc.api('POST','/v1/inAppPurchasePriceSchedules',{'data':{'type':'inAppPurchasePriceSchedules','relationships':{'inAppPurchase':{'data':{'type':'inAppPurchases','id':IID}},'baseTerritory':{'data':{'type':'territories','id':'USA'}},'manualPrices':{'data':[{'type':'inAppPurchasePrices','id':'${price-usa}'}]}}},'included':[{'type':'inAppPurchasePrices','id':'${price-usa}','attributes':{'startDate':None},'relationships':{'inAppPurchasePricePoint':{'data':{'type':'inAppPurchasePricePoints','id':pt['id']}}}}]})
        print('  price schedule', 'ok' if 'data' in r else json.dumps(r)[:400])
    else: print('  price schedule exists')
    shot=asc.api('GET',f'/v1/inAppPurchasesV2/{IID}/appStoreReviewScreenshot')
    if not shot.get('data'):
        r=asc.upload_asset('/v1/inAppPurchaseAppStoreReviewScreenshots',{'data':{'type':'inAppPurchaseAppStoreReviewScreenshots','attributes':{'fileName':'06.png'},'relationships':{'inAppPurchaseV2':{'data':{'type':'inAppPurchases','id':IID}}}}},SHOT,'inAppPurchaseAppStoreReviewScreenshots')
        print('  review shot', 'ok' if 'data' in r else json.dumps(r)[:300])
time.sleep(3)
for x in asc.api('GET',f'/v1/apps/{APP}/inAppPurchasesV2?limit=200&fields[inAppPurchases]=productId,state')['data']: print('FINAL', x['id'], x['attributes'])
