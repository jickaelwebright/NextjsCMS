module.exports=[42150,e=>{"use strict";let t={openai:"https://api.openai.com/v1",openrouter:"https://openrouter.ai/api/v1","nvidia-nim":"https://integrate.api.nvidia.com/v1"},a=new Set(["openai","openrouter"]),r=`
Block types (each has "id": string, "type": string, "styles": {}):

heading  → {"type":"heading","id":"b1","props":{"content":"Section Title","level":2,"align":"center","color":"#111827"},"styles":{}}
text     → {"type":"text","id":"b2","props":{"content":"<p>Body copy here. Use <strong>bold</strong> for emphasis.</p>","align":"left","fontSize":"base"},"styles":{}}
image    → {"type":"image","id":"b3","props":{"src":"","alt":"Descriptive alt text","objectFit":"cover"},"styles":{}}
button   → {"type":"button","id":"b4","props":{"label":"Get Started","href":"#contact","variant":"primary","size":"md","align":"center"},"styles":{}}
hero     → {"type":"hero","id":"b5","props":{"heading":"Your Main Headline","subheading":"A compelling subtitle","ctaLabel":"Start Free Trial","ctaHref":"#","backgroundOverlay":50,"minHeight":"70vh","align":"center","textColor":"#ffffff"},"styles":{}}
card     → {"type":"card","id":"b6","props":{"heading":"Feature Name","body":"What this feature does and why it matters.","ctaLabel":"Learn More","ctaHref":"#","variant":"default"},"styles":{}}
divider  → {"type":"divider","id":"b7","props":{"style":"solid","color":"#e5e7eb","thickness":1},"styles":{}}
spacer   → {"type":"spacer","id":"b8","props":{"height":48},"styles":{}}
form     → {"type":"form","id":"b9","props":{"submitLabel":"Send Message","successMessage":"Thank you! We will be in touch shortly.","fields":[{"id":"f1","type":"text","label":"Full Name","placeholder":"Your name","required":true},{"id":"f2","type":"email","label":"Email","placeholder":"you@example.com","required":true},{"id":"f3","type":"textarea","label":"Message","placeholder":"How can we help?","required":false}]},"styles":{}}`.trim(),n=`
Column span rules (spans must sum to 12):
  "1"                 → one column,  spans: [12]
  "1/2+1/2"           → two columns, spans: [6, 6]
  "1/3+2/3"           → two columns, spans: [4, 8]
  "2/3+1/3"           → two columns, spans: [8, 4]
  "1/3+1/3+1/3"       → three columns, spans: [4, 4, 4]
  "1/4+1/4+1/4+1/4"  → four columns, spans: [3, 3, 3, 3]`.trim(),o=`You are a professional web page content generator for a visual CMS builder.

Given a page description, return a complete PageDocument JSON object.

CRITICAL OUTPUT RULES:
- Return ONLY raw JSON. No markdown. No code fences. No explanations.
- Your entire response must be a single JSON object starting with { and ending with }.

=== SCHEMA ===

PageDocument:
{
  "version": 1,
  "meta": {"title": string, "slug": string, "description"?: string},
  "settings": {"headerVisible": true, "footerVisible": true},
  "sections": Section[]
}

Section:
{
  "id": string,
  "columnLayout": "1" | "1/2+1/2" | "1/3+2/3" | "2/3+1/3" | "1/3+1/3+1/3" | "1/4+1/4+1/4+1/4",
  "columns": Column[],
  "styles": {"mobile": {"paddingTop": "64px", "paddingBottom": "64px"}, "tablet": {}, "desktop": {}},
  "containerWidth": "xl"
}

Column: {"id": string, "span": number, "blocks": Block[], "styles": {}}

${n}

${r}

=== DESIGN RULES ===
1. Start with a hero block (first section, layout "1") — not just a heading
2. Use card blocks in "1/3+1/3+1/3" sections for features/services/benefits (3 per row)
3. Use "1/4+1/4+1/4+1/4" for 4-item grids (stats, small icons, team members)
4. Use "1/2+1/2" for content-beside-image or two-column text layouts
5. End landing pages with a contact form or strong CTA section
6. Use h1 only in the hero (or never — hero block handles it). Use h2 for section titles, h3 for card headings
7. image src must always be "" — users upload images via the media library
8. text block content must be valid HTML (wrap paragraphs in <p>, use <strong> for bold)
9. Write professional, industry-specific copy — not generic lorem ipsum
10. IDs: sections "s1","s2","s3"; columns "c1a","c1b","c2a","c2b"; blocks "b1","b2","b3" (all unique)
11. Add spacer blocks (height 40–80) between major sections for visual breathing room
12. section styles paddingTop/paddingBottom: "80px" for hero, "64px" for other sections`,s=`You are a professional web section content generator for a visual CMS builder.

Given a description, return a single Section JSON object.

CRITICAL OUTPUT RULES:
- Return ONLY raw JSON. No markdown. No code fences. No explanations.
- Your entire response must be a single JSON object starting with { and ending with }.

=== SECTION SCHEMA ===

{
  "id": "s1",
  "columnLayout": "1" | "1/2+1/2" | "1/3+2/3" | "2/3+1/3" | "1/3+1/3+1/3" | "1/4+1/4+1/4+1/4",
  "columns": [{"id": "c1a", "span": number, "blocks": Block[], "styles": {}}],
  "styles": {"mobile": {"paddingTop": "64px", "paddingBottom": "64px"}, "tablet": {}, "desktop": {}},
  "containerWidth": "xl"
}

${n}

${r}

Write professional, industry-appropriate copy. Use realistic content, not lorem ipsum.
IDs must be unique strings: "s1", columns "c1a","c1b", blocks "b1","b2","b3".
image src must always be "".`;async function i(e,r,n){let o=t[e.provider],s=a.has(e.provider),i={"Content-Type":"application/json",Authorization:`Bearer ${e.apiKey}`};"openrouter"===e.provider&&(i["HTTP-Referer"]=process.env.NEXTAUTH_URL??"http://localhost:3000",i["X-Title"]="NextjsCMS AI Builder");let l={model:e.model,messages:[{role:"system",content:r},{role:"user",content:n}],temperature:.7,max_tokens:4096};s&&(l.response_format={type:"json_object"});let c=await fetch(`${o}/chat/completions`,{method:"POST",headers:i,body:JSON.stringify(l)});if(!c.ok){let t=await c.text().catch(()=>c.statusText);throw Error(`${e.provider} error ${c.status}: ${t}`)}let p=await c.json(),u=p?.choices?.[0]?.message?.content;if(!u)throw Error("Empty response from AI provider");return u}async function l(e,t,a){let r=`https://generativelanguage.googleapis.com/v1beta/models/${e.model}:generateContent?key=${e.apiKey}`,n=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:a}]}],systemInstruction:{parts:[{text:t}]},generationConfig:{temperature:.7,maxOutputTokens:4096,responseMimeType:"application/json"}})});if(!n.ok){let e=await n.text().catch(()=>n.statusText);throw Error(`Gemini error ${n.status}: ${e}`)}let o=await n.json(),s=o?.candidates?.[0]?.content?.parts?.[0]?.text;if(!s)throw Error("Empty response from Gemini");return s}async function c(e,t,a){let r="page"===a?o:s,n=("gemini"===e.provider?await l(e,r,t):await i(e,r,t)).trim();try{return JSON.parse(n)}catch{}let c=n.match(/```(?:json)?\s*([\s\S]*?)```/);if(c)try{return JSON.parse(c[1].trim())}catch{}let p=n.indexOf("{"),u=n.lastIndexOf("}");if(-1!==p&&u>p)try{return JSON.parse(n.slice(p,u+1))}catch{}throw Error("AI returned invalid JSON. Try again or use a different model.")}e.s(["generateWithAI",0,c])},5791,e=>e.a(async(t,a)=>{try{var r=e.i(89171),n=e.i(79832),o=e.i(14543),s=e.i(9514),i=e.i(75225),l=e.i(42150),c=e.i(69719),p=t([n,o]);[n,o]=p.then?(await p)():p;let d=c.z.object({prompt:c.z.string().min(1).max(2e3),provider:c.z.enum(["openai","openrouter","nvidia-nim","gemini"]),model:c.z.string().min(1),mode:c.z.enum(["page","section"]).default("page")}),m={openai:"ai_openai_key",openrouter:"ai_openrouter_key","nvidia-nim":"ai_nim_key",gemini:"ai_gemini_key"};async function u(e){let t=await (0,n.auth)();if(!t)return r.NextResponse.json({error:"Unauthorized"},{status:401});let a=t.user.tenantSlug,c=await (0,o.getTenantDb)(a),p=await e.json(),u=d.safeParse(p);if(!u.success)return r.NextResponse.json({error:u.error.flatten()},{status:400});let{prompt:h,provider:g,model:f,mode:y}=u.data,b=m[g],v=await c.select().from(s.siteSettings).where((0,i.eq)(s.siteSettings.key,b)),w=v[0]?.value??null;if(!w)return r.NextResponse.json({error:`No API key configured for ${g}. Go to Settings → AI Integration to add your key.`,missingKey:!0},{status:400});try{let e=await (0,l.generateWithAI)({provider:g,apiKey:w,model:f},h,y);return r.NextResponse.json({result:e})}catch(t){let e=t instanceof Error?t.message:"Generation failed";return r.NextResponse.json({error:e},{status:500})}}e.s(["POST",0,u,"dynamic",0,"force-dynamic"]),a()}catch(e){a(e)}},!1),72392,e=>e.a(async(t,a)=>{try{var r=e.i(47909),n=e.i(74017),o=e.i(96250),s=e.i(59756),i=e.i(61916),l=e.i(74677),c=e.i(69741),p=e.i(16795),u=e.i(87718),d=e.i(95169),m=e.i(47587),h=e.i(66012),g=e.i(70101),f=e.i(26937),y=e.i(10372),b=e.i(93695);e.i(20232);var v=e.i(220),w=e.i(5791),R=t([w]);[w]=R.then?(await R)():R;let S=new r.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/ai/generate-page/route",pathname:"/api/ai/generate-page",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/ai/generate-page/route.ts",nextConfigOutput:"",userland:w,...{}}),{workAsyncStorage:E,workUnitAsyncStorage:N,serverHooks:C}=S;async function x(e,t,a){a.requestMeta&&(0,s.setRequestMeta)(e,a.requestMeta),S.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/ai/generate-page/route";r=r.replace(/\/index$/,"")||"/";let o=await S.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!o)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:w,deploymentId:R,params:x,nextConfig:E,parsedUrl:N,isDraftMode:C,prerenderManifest:T,routerServerContext:A,isOnDemandRevalidate:O,revalidateOnlyGenerated:k,resolvedPathname:I,clientReferenceManifest:P,serverActionsManifest:_}=o,U=(0,c.normalizeAppPath)(r),j=!!(T.dynamicRoutes[U]||T.routes[I]),H=async()=>((null==A?void 0:A.render404)?await A.render404(e,t,N,!1):t.end("This page could not be found"),null);if(j&&!C){let e=!!T.routes[I],t=T.dynamicRoutes[U];if(t&&!1===t.fallback&&!e){if(E.adapterPath)return await H();throw new b.NoFallbackError}}let M=null;!j||S.isDev||C||(M=I,M="/index"===M?"/":M);let q=!0===S.isDev||!j,$=j&&!q;_&&P&&(0,l.setManifestsSingleton)({page:r,clientReferenceManifest:P,serverActionsManifest:_});let D=e.method||"GET",L=(0,i.getTracer)(),B=L.getActiveScopeSpan(),F=!!(null==A?void 0:A.isWrappedByNextServer),J=!!(0,s.getRequestMeta)(e,"minimalMode"),G=(0,s.getRequestMeta)(e,"incrementalCache")||await S.getIncrementalCache(e,E,T,J);null==G||G.resetRequestCache(),globalThis.__incrementalCache=G;let K={params:x,previewProps:T.preview,renderOpts:{experimental:{authInterrupts:!!E.experimental.authInterrupts},cacheComponents:!!E.cacheComponents,supportsDynamicResponse:q,incrementalCache:G,cacheLifeProfiles:E.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>S.onRequestError(e,t,r,n,A)},sharedContext:{buildId:w,deploymentId:R}},W=new p.NodeNextRequest(e),z=new p.NodeNextResponse(t),Y=u.NextRequestAdapter.fromNodeNextRequest(W,(0,u.signalFromNodeResponse)(t));try{let o,s=async e=>S.handle(Y,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=L.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=a.get("next.route");if(n){let t=`${D} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t),o&&o!==e&&(o.setAttribute("http.route",n),o.updateName(t))}else e.updateName(`${D} ${r}`)}),l=async o=>{var i,l;let c=async({previousCacheEntry:n})=>{try{if(!J&&O&&k&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await s(o);e.fetchMetrics=K.renderOpts.fetchMetrics;let i=K.renderOpts.pendingWaitUntil;i&&a.waitUntil&&(a.waitUntil(i),i=void 0);let l=K.renderOpts.collectedTags;if(!j)return await (0,h.sendResponse)(W,z,r,K.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,g.toNodeOutgoingHttpHeaders)(r.headers);l&&(t[y.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=y.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,n=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=y.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await S.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,m.getRevalidateReason)({isStaticGeneration:$,isOnDemandRevalidate:O})},!1,A),t}},p=await S.handleResponse({req:e,nextConfig:E,cacheKey:M,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:T,isRoutePPREnabled:!1,isOnDemandRevalidate:O,revalidateOnlyGenerated:k,responseGenerator:c,waitUntil:a.waitUntil,isMinimalMode:J});if(!j)return null;if((null==p||null==(i=p.value)?void 0:i.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==p||null==(l=p.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});J||t.setHeader("x-nextjs-cache",O?"REVALIDATED":p.isMiss?"MISS":p.isStale?"STALE":"HIT"),C&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,g.fromNodeOutgoingHttpHeaders)(p.value.headers);return J&&j||u.delete(y.NEXT_CACHE_TAGS_HEADER),!p.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,f.getCacheControlHeader)(p.cacheControl)),await (0,h.sendResponse)(W,z,new Response(p.value.body,{headers:u,status:p.value.status||200})),null};F&&B?await l(B):(o=L.getActiveScopeSpan(),await L.withPropagatedContext(e.headers,()=>L.trace(d.BaseServerSpan.handleRequest,{spanName:`${D} ${r}`,kind:i.SpanKind.SERVER,attributes:{"http.method":D,"http.target":e.url}},l),void 0,!F))}catch(t){if(t instanceof b.NoFallbackError||await S.onRequestError(e,t,{routerKind:"App Router",routePath:U,routeType:"route",revalidateReason:(0,m.getRevalidateReason)({isStaticGeneration:$,isOnDemandRevalidate:O})},!1,A),j)throw t;return await (0,h.sendResponse)(W,z,new Response(null,{status:500})),null}}e.s(["handler",0,x,"patchFetch",0,function(){return(0,o.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:N})},"routeModule",0,S,"serverHooks",0,C,"workAsyncStorage",0,E,"workUnitAsyncStorage",0,N]),a()}catch(e){a(e)}},!1)];

//# sourceMappingURL=_0dpmz_2._.js.map