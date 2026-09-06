"""Set Porch Cats App Store metadata + screenshots via ASC API. Idempotent.
Run: cd ~/workspace/landed/.credentials && PYTHONPATH=. python3 ~/workspace/porchcats/store/asc_metadata.py <APP_ID> [SUB_ID ...]"""
import asc, json, os, glob, time, sys
APP=sys.argv[1]; SUBS=tuple(sys.argv[2:])
SHOTS=sorted(glob.glob('/Users/raymondzhao/workspace/porchcats/store/screenshots/0*.png'))
DESC="""Put out a bowl. See who comes.

Porch Cats is a cozy cat-collecting game. Leave food and a few things on the porch. Neighbourhood cats drop by while you are away, nap on your stuff, and leave fish as thanks. Come back to a note about who was here. Pet the ones you catch. Thirty-one cats to collect, and one more for Club members.

CATS KEEP THEIR OWN HOURS
The porch runs in real time, including while the app is closed. Open it after work and Biscuit has loafed in the box for two hours and left fourteen silver fish. Open it in the morning and there is a whole night of notes. You never come back to an empty porch with nothing to read.

PET THEM
Tap a cat while it is there. It purrs. Bond grows, gifts grow with it, and at bond five the cat leaves a memento in your Catbook.

THE PORCH
Five spots and a bowl. Put out a cushion, a box, a scratching post, a teapot, an old radio. Each cat likes two kinds of thing; rare cats need the good food and something they love.

THE BACKYARD
Four more spots, a lawn, and the cats that only visit there.

FISH
Silver fish come from every visit and buy toys and food. Gold fish buy the rare things. Swap 500 silver for 10 gold once a day, free, or pick some up in the Shop.

CATBOOK
Thirty-one cats with personalities, favourites, visit counts and mementos. Silhouettes until you meet them.

NO ADS
Ever. No energy bars. Nothing timed to make you pay. Thrifty Bits are always free, and every cat except Jeeves can be met on a free porch.

CAT CLUB
An optional membership: Jeeves the butler keeps the bowl full while you are away, 5 gold fish a day instead of 1, two fish exchanges a day, the backyard included, and Jeeves himself as a Club-only cat. Monthly or yearly, each with a 7-day free trial. Payment is charged to your Apple ID account at confirmation of purchase after the trial. Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period. Manage or cancel in your Apple ID settings. Gold fish packs are one-time purchases.

PRIVATE
No account, no analytics, no server. Your porch lives on your phone.

Terms of Use (EULA): https://tryforma.app/porchcats/terms.html
Privacy Policy: https://tryforma.app/porchcats/privacy.html"""
KEYWORDS="cat game,kitty collector,cozy game,idle cat,cat collecting,cute cats,relaxing game,neko,pet cats"
PROMO="Cats visit while you're away, nap on your stuff, leave fish and a note. Pet the ones you catch. 31 cats to collect. No ads, ever."
def ok(r,what):
    if 'data' in r: return r['data']
    print('FAIL',what,json.dumps(r)[:600]); return None
v=asc.api('GET',f'/v1/apps/{APP}/appStoreVersions?filter[platform]=IOS&limit=1&fields[appStoreVersions]=versionString,appStoreState')['data'][0]
VID=v['id']; print('version', v['attributes'])
locs=asc.api('GET',f'/v1/appStoreVersions/{VID}/appStoreVersionLocalizations')['data']
en=next((l for l in locs if l['attributes']['locale']=='en-US'),None)
attrs={'description':DESC,'keywords':KEYWORDS[:100],'promotionalText':PROMO[:170],'supportUrl':'https://tryforma.app/porchcats/','marketingUrl':'https://tryforma.app/porchcats/'}
if en: r=asc.api('PATCH',f"/v1/appStoreVersionLocalizations/{en['id']}",{'data':{'type':'appStoreVersionLocalizations','id':en['id'],'attributes':attrs}})
else: r=asc.api('POST','/v1/appStoreVersionLocalizations',{'data':{'type':'appStoreVersionLocalizations','attributes':dict(attrs,locale='en-US'),'relationships':{'appStoreVersion':{'data':{'type':'appStoreVersions','id':VID}}}}})
en=ok(r,'version loc'); print('version localization ok', en['id'] if en else '')
for info in asc.api('GET',f'/v1/apps/{APP}/appInfos')['data']:
    il=asc.api('GET',f"/v1/appInfos/{info['id']}/appInfoLocalizations")['data']
    l=next((x for x in il if x['attributes']['locale']=='en-US'),None)
    a={'subtitle':'Cozy Cat Collecting Game','privacyPolicyUrl':'https://tryforma.app/porchcats/privacy.html'}
    if l: r=asc.api('PATCH',f"/v1/appInfoLocalizations/{l['id']}",{'data':{'type':'appInfoLocalizations','id':l['id'],'attributes':a}})
    else: r=asc.api('POST','/v1/appInfoLocalizations',{'data':{'type':'appInfoLocalizations','attributes':dict(a,locale='en-US'),'relationships':{'appInfo':{'data':{'type':'appInfos','id':info['id']}}}}})
    print('appInfo loc', 'ok' if 'data' in r else json.dumps(r)[:300])
    r=asc.api('PATCH',f"/v1/appInfos/{info['id']}",{'data':{'type':'appInfos','id':info['id'],'relationships':{'primaryCategory':{'data':{'type':'appCategories','id':'GAMES'}},'primarySubcategoryOne':{'data':{'type':'appCategories','id':'GAMES_CASUAL'}},'primarySubcategoryTwo':{'data':{'type':'appCategories','id':'GAMES_SIMULATION'}},'secondaryCategory':{'data':{'type':'appCategories','id':'ENTERTAINMENT'}}}}})
    print('categories', 'ok' if 'data' in r else json.dumps(r)[:300])
    ar=asc.api('GET',f"/v1/appInfos/{info['id']}/ageRatingDeclaration")
    if ar.get('data'):
        r=asc.api('PATCH',f"/v1/ageRatingDeclarations/{ar['data']['id']}",{'data':{'type':'ageRatingDeclarations','id':ar['data']['id'],'attributes':{'medicalOrTreatmentInformation':'NONE','healthOrWellnessTopics':False,'alcoholTobaccoOrDrugUseOrReferences':'NONE','violenceCartoonOrFantasy':'NONE','violenceRealistic':'NONE','violenceRealisticProlongedGraphicOrSadistic':'NONE','profanityOrCrudeHumor':'NONE','matureOrSuggestiveThemes':'NONE','horrorOrFearThemes':'NONE','sexualContentOrNudity':'NONE','sexualContentGraphicAndNudity':'NONE','gamblingSimulated':'NONE','contests':'NONE','gambling':False,'unrestrictedWebAccess':False,'kidsAgeBand':None,'lootBox':False,'advertising':False,'messagingAndChat':False,'userGeneratedContent':False,'parentalControls':False,'ageAssurance':False}}})
        print('age rating', 'ok' if 'data' in r else json.dumps(r)[:300])
r=asc.api('PATCH',f'/v1/apps/{APP}',{'data':{'type':'apps','id':APP,'attributes':{'contentRightsDeclaration':'DOES_NOT_USE_THIRD_PARTY_CONTENT'}}}); print('content rights', 'ok' if 'data' in r else json.dumps(r)[:200])
r=asc.api('PATCH',f'/v1/appStoreVersions/{VID}',{'data':{'type':'appStoreVersions','id':VID,'attributes':{'copyright':'2026 RZ International LLC','releaseType':'AFTER_APPROVAL'}}}); print('version attrs', 'ok' if 'data' in r else json.dumps(r)[:200])
rd=asc.api('GET',f'/v1/appStoreVersions/{VID}/appStoreReviewDetail')
ra={'contactFirstName':'Ruihao','contactLastName':'Zhao','contactPhone':'+14155550100','contactEmail':'ray@thezenithlabs.com','demoAccountRequired':False,'notes':"Porch Cats is a local-only idle cat-collecting game (Neko Atsume-style). No account or sign-in. Onboarding is three screens (name your porch), then the Cat Club paywall appears once; tap 'Skip' to play free. Cats visit on real-time timers (roughly one every 40-70 minutes early on, replayed when the app reopens), so the porch fills over hours; the 'While you were out' list shows visits that happened while closed. Tap a cat to pet it; tap an empty spot to place an owned item; the Shop sells food and items for in-game silver/gold fish. Gold fish packs are consumable in-app purchases (credited immediately); the Cat Club is an auto-renewable subscription with a 7-day free trial, and every game feature except the Club-only cat is reachable without paying. No ads, no third-party SDKs other than RevenueCat for purchases. All game data is stored on the device."}
if rd.get('data'): r=asc.api('PATCH',f"/v1/appStoreReviewDetails/{rd['data']['id']}",{'data':{'type':'appStoreReviewDetails','id':rd['data']['id'],'attributes':ra}})
else: r=asc.api('POST','/v1/appStoreReviewDetails',{'data':{'type':'appStoreReviewDetails','attributes':ra,'relationships':{'appStoreVersion':{'data':{'type':'appStoreVersions','id':VID}}}}})
print('review detail', 'ok' if 'data' in r else json.dumps(r)[:300])
if en and SHOTS:
    sets=asc.api('GET',f"/v1/appStoreVersionLocalizations/{en['id']}/appScreenshotSets?fields[appScreenshotSets]=screenshotDisplayType")['data']
    st=next((s for s in sets if s['attributes']['screenshotDisplayType']=='APP_IPHONE_67'),None)
    if not st: st=ok(asc.api('POST','/v1/appScreenshotSets',{'data':{'type':'appScreenshotSets','attributes':{'screenshotDisplayType':'APP_IPHONE_67'},'relationships':{'appStoreVersionLocalization':{'data':{'type':'appStoreVersionLocalizations','id':en['id']}}}}}),'set')
    have=[x['attributes']['fileName'] for x in asc.api('GET',f"/v1/appScreenshotSets/{st['id']}/appScreenshots?fields[appScreenshots]=fileName")['data']]
    for f in SHOTS:
        if os.path.basename(f) in have: continue
        r=asc.upload_asset('/v1/appScreenshots',{'data':{'type':'appScreenshots','attributes':{'fileName':os.path.basename(f)},'relationships':{'appScreenshotSet':{'data':{'type':'appScreenshotSets','id':st['id']}}}}},f,'appScreenshots')
        print('  shot', os.path.basename(f), 'ok' if 'data' in r else json.dumps(r)[:200])
for sid in SUBS:
    cur=asc.api('GET',f'/v1/subscriptions/{sid}/appStoreReviewScreenshot')
    if cur.get('data'): print('sub', sid, 'review shot exists'); continue
    r=asc.upload_asset('/v1/subscriptionAppStoreReviewScreenshots',{'data':{'type':'subscriptionAppStoreReviewScreenshots','attributes':{'fileName':'06.png'},'relationships':{'subscription':{'data':{'type':'subscriptions','id':sid}}}}},SHOTS[5],'subscriptionAppStoreReviewScreenshots')
    print('sub', sid, 'review shot', 'ok' if 'data' in r else json.dumps(r)[:300])
time.sleep(3)
for sid in SUBS: print('sub state', asc.api('GET',f'/v1/subscriptions/{sid}?fields[subscriptions]=name,state')['data']['attributes'])
print('DONE')
