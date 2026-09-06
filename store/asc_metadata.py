"""Set Undim App Store metadata + screenshots via ASC API. Idempotent.
Run: cd ~/workspace/landed/.credentials && PYTHONPATH=. python3 ~/workspace/undim/store/asc_metadata.py <APP_ID> [SUB_ID ...]"""
import asc, json, os, glob, time, sys
APP=sys.argv[1]; SUBS=tuple(sys.argv[2:])
SHOTS=sorted(glob.glob('/Users/raymondzhao/workspace/undim/store/screenshots/0*.png'))
DESC="""Antidepressants that work can also turn the volume down on everything. Nearly half of people on them report it: fewer highs, fewer lows, not crying at what should make you cry, not wanting what you used to want. It has a name, emotional blunting, and Undim is for the part that comes after you notice it.

Undim does not tell you to stop or change a dose. Only your prescriber does that, and never abruptly. What Undim does is build the scaffolding the evidence says makes a supervised taper survivable, measure it, and hand you a one-page summary to bring to the person who writes the script.

ONE THING A DAY
Behavioural activation: one small act tied to what used to light you up, done whether or not you feel like it. In the COBRA trial it was as effective as CBT. Pick a size: tiny, small, normal. Tiny counts.

THE FLAME
Grows with your last three weeks and never resets. A missed day dims it a little. There are no streaks to break and nothing to feel guilty about.

FIVE PILLARS
Moved. Daylight. A person. On purpose. Clean inputs. The things every recovery account and every trial keep pointing at. Tap what happened today; any size counts.

CHECK-IN
Mood, energy, and how much got through. The third one is the un-dimming signal, and the record your prescriber will want to see.

WEEKLY PHQ-9
The nine-question depression measure clinicians use, public domain, stored only on your phone. Question 9 always shows crisis resources (988 in the US, findahelpline.com elsewhere).

READINESS
A 0–100 score from your last 28 days: mood steadiness, movement, daylight, people, purpose, a support person, whether your prescriber knows. A conversation starter, not a decision. If the PHQ-9 self-harm question is above zero the score is capped and the crisis card is shown.

SPARKS
Small acts sorted by what used to light you up, each with the reason it counts. A purpose act every week that is bigger than a day.

LEARN
Short, sourced cards: why you feel dimmed, why one thing a day is a treatment, how exercise matched sertraline in the SMILE trials, why withdrawal is not relapse, what hyperbolic tapering is and how to ask for it, and why scaffolding comes first (the PREVENT trial).

PRIVATE BY DESIGN
No account, no server, no analytics. Everything stays on your phone. Delete the app and it is gone.

UNDIM PRO
Today, the flame, the pillars, the PHQ-9 and Learn are free forever. Pro adds the prescriber report, twelve-week trends, a daily reminder and your own sparks: monthly or yearly, each with a 7-day free trial. Payment is charged to your Apple ID account at confirmation of purchase after the trial. Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period. Manage or cancel in your Apple ID settings.

Undim is a self-care tool, not medical advice, diagnosis or treatment. Decisions about medication belong to you and your prescriber.

Terms of Use (EULA): https://tryforma.app/undim/terms.html
Privacy Policy: https://tryforma.app/undim/privacy.html"""
KEYWORDS="antidepressant,depression,numb,mood,phq-9,therapy,habit,self care,journal,mental health,purpose"
PROMO="One small thing a day, five evidence pillars, a weekly PHQ-9, and a 28-day readiness summary for your prescriber. Never a dose. Stays on your phone."
def ok(r,what):
    if 'data' in r: return r['data']
    print('FAIL',what,json.dumps(r)[:600]); return None
v=asc.api('GET',f'/v1/apps/{APP}/appStoreVersions?filter[platform]=IOS&limit=1&fields[appStoreVersions]=versionString,appStoreState')['data'][0]
VID=v['id']; print('version', v['attributes'])
locs=asc.api('GET',f'/v1/appStoreVersions/{VID}/appStoreVersionLocalizations')['data']
en=next((l for l in locs if l['attributes']['locale']=='en-US'),None)
attrs={'description':DESC,'keywords':KEYWORDS[:100],'promotionalText':PROMO[:170],'supportUrl':'https://tryforma.app/undim/','marketingUrl':'https://tryforma.app/undim/'}
if en: r=asc.api('PATCH',f"/v1/appStoreVersionLocalizations/{en['id']}",{'data':{'type':'appStoreVersionLocalizations','id':en['id'],'attributes':attrs}})
else: r=asc.api('POST','/v1/appStoreVersionLocalizations',{'data':{'type':'appStoreVersionLocalizations','attributes':dict(attrs,locale='en-US'),'relationships':{'appStoreVersion':{'data':{'type':'appStoreVersions','id':VID}}}}})
en=ok(r,'version loc'); print('version localization ok', en['id'] if en else '')
infos=asc.api('GET',f'/v1/apps/{APP}/appInfos')['data']
for info in infos:
    il=asc.api('GET',f"/v1/appInfos/{info['id']}/appInfoLocalizations")['data']
    l=next((x for x in il if x['attributes']['locale']=='en-US'),None)
    a={'subtitle':'Feel Again, On Purpose','privacyPolicyUrl':'https://tryforma.app/undim/privacy.html'}
    if l: r=asc.api('PATCH',f"/v1/appInfoLocalizations/{l['id']}",{'data':{'type':'appInfoLocalizations','id':l['id'],'attributes':a}})
    else: r=asc.api('POST','/v1/appInfoLocalizations',{'data':{'type':'appInfoLocalizations','attributes':dict(a,locale='en-US'),'relationships':{'appInfo':{'data':{'type':'appInfos','id':info['id']}}}}})
    print('appInfo loc', 'ok' if 'data' in r else json.dumps(r)[:300])
    r=asc.api('PATCH',f"/v1/appInfos/{info['id']}",{'data':{'type':'appInfos','id':info['id'],'relationships':{'primaryCategory':{'data':{'type':'appCategories','id':'HEALTH_AND_FITNESS'}},'secondaryCategory':{'data':{'type':'appCategories','id':'LIFESTYLE'}}}}})
    print('categories', 'ok' if 'data' in r else json.dumps(r)[:300])
    # age rating: medical/treatment information infrequent-mild; health/wellness topics
    ar=asc.api('GET',f"/v1/appInfos/{info['id']}/ageRatingDeclaration")
    if ar.get('data'):
        r=asc.api('PATCH',f"/v1/ageRatingDeclarations/{ar['data']['id']}",{'data':{'type':'ageRatingDeclarations','id':ar['data']['id'],'attributes':{'medicalOrTreatmentInformation':'INFREQUENT_OR_MILD','healthOrWellnessTopics':True,'alcoholTobaccoOrDrugUseOrReferences':'NONE','violenceCartoonOrFantasy':'NONE','violenceRealistic':'NONE','violenceRealisticProlongedGraphicOrSadistic':'NONE','profanityOrCrudeHumor':'NONE','matureOrSuggestiveThemes':'NONE','horrorOrFearThemes':'NONE','sexualContentOrNudity':'NONE','sexualContentGraphicAndNudity':'NONE','gamblingSimulated':'NONE','contests':'NONE','gambling':False,'unrestrictedWebAccess':False,'kidsAgeBand':None,'lootBox':False,'advertising':False,'messagingAndChat':False,'userGeneratedContent':False,'parentalControls':False,'ageAssurance':False}}})
        print('age rating', 'ok' if 'data' in r else json.dumps(r)[:300])
r=asc.api('PATCH',f'/v1/apps/{APP}',{'data':{'type':'apps','id':APP,'attributes':{'contentRightsDeclaration':'DOES_NOT_USE_THIRD_PARTY_CONTENT'}}}); print('content rights', 'ok' if 'data' in r else json.dumps(r)[:200])
r=asc.api('PATCH',f'/v1/appStoreVersions/{VID}',{'data':{'type':'appStoreVersions','id':VID,'attributes':{'copyright':'2026 RZ International LLC','releaseType':'AFTER_APPROVAL'}}}); print('version attrs', 'ok' if 'data' in r else json.dumps(r)[:200])
rd=asc.api('GET',f'/v1/appStoreVersions/{VID}/appStoreReviewDetail')
ra={'contactFirstName':'Ruihao','contactLastName':'Zhao','contactPhone':'+14155550100','contactEmail':'ray@thezenithlabs.com','demoAccountRequired':False,'notes':"Undim is a local-only self-care habit app for adults on antidepressants or in therapy. No account, no sign-in, no server. Onboarding asks where the user is (medication / therapy / both / thinking about tapering / just dimmed), what feels dimmed, what used to light them up, a name and an optional 'why', then shows the paywall (monthly or yearly, 7-day free trial); tap 'Continue with the free version' for the free tier, which includes the whole daily loop (one thing, check-in, five pillars, the flame, the weekly PHQ-9 and all Learn cards). Pro adds a plain-text 28-day summary the user can share with their prescriber, 12-week trends, a local daily reminder and custom acts.\n\nGuideline 1.4.1: the app is not medical advice or treatment and never suggests starting, stopping, skipping or changing a medication; this is stated in onboarding, in Learn, on the Readiness screen, in the report itself and in the About sheet. The PHQ-9 is the public-domain instrument (Kroenke, Spitzer, Williams). Every Learn card cites its source (COBRA trial, SMILE-II, PREVENT, Cochrane, peer-reviewed tapering literature) with a tappable link. If PHQ-9 question 9 is answered above zero, a crisis card (988 / findahelpline.com) is shown and the readiness score is capped.\n\nHealth data (mood check-ins, PHQ-9 answers) is stored only on the device and is never transmitted. The app does not read or write HealthKit."}
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
    if not SHOTS: continue
    r=asc.upload_asset('/v1/subscriptionAppStoreReviewScreenshots',{'data':{'type':'subscriptionAppStoreReviewScreenshots','attributes':{'fileName':'02.png'},'relationships':{'subscription':{'data':{'type':'subscriptions','id':sid}}}}},SHOTS[1],'subscriptionAppStoreReviewScreenshots')
    print('sub', sid, 'review shot', 'ok' if 'data' in r else json.dumps(r)[:300])
time.sleep(3)
for sid in SUBS:
    print('sub state', asc.api('GET',f'/v1/subscriptions/{sid}?fields[subscriptions]=name,state')['data']['attributes'])
print('DONE')
