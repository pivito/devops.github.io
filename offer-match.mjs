const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const skills=[
 ['Linux',/\blinux\b|\bubuntu\b|\bdebian\b|\brhel\b/,'Experiencia profesional en administración de sistemas Linux.'],
 ['Kubernetes',/\bkubernetes\b|\bk8s\b/,'Experiencia profesional en Kubernetes; laboratorio local con KIND.'],
 ['Docker',/\bdocker\b|\bcontenedores\b/,'Experiencia profesional con Docker y plataformas multi-tenant.'],
 ['OpenStack',/\bopenstack\b/,'Experiencia profesional en Logicalis, IAAS365 y Cibervoluntarios.'],
 ['Terraform',/\bterraform\b/,'Infraestructura Kubernetes sobre OpenStack mediante Terraform.'],
 ['Ansible',/\bansible\b/,'Automatización de provisión y monitorización.'],
 ['Jenkins',/\bjenkins\b/,'Proyecto personal: pipeline con SonarQube, Trivy y construcción de imágenes.'],
 ['GitHub Actions',/github\s*actions/,'Experiencia profesional con pipelines de despliegue.'],
 ['GitOps / Argo CD',/\bgitops\b|argo\s*cd/,'Proyecto personal: Argo CD y Kustomize en DEV y STG.'],
 ['Grafana',/\bgrafana\b/,'Experiencia profesional en dashboards y observabilidad.'],
 ['Prometheus',/\bprometheus\b/,'Tecnología recogida en el perfil; alcance específico por confirmar.'],
 ['Loki / ELK',/\bloki\b|\belk\b|\belasticsearch\b|\bopensearch\b|\bkibana\b/,'Experiencia en logging y observabilidad.'],
 ['Bash',/\bbash\b|\bshell\b/,'Automatización profesional con scripts Bash.'],
 ['Python',/\bpython\b/,'Tecnología recogida en el perfil; nivel requerido por confirmar.'],
 ['NGINX',/\bnginx\b/,'Experiencia profesional en proxy y despliegues con TLS.'],
 ['PostgreSQL',/\bpostgres(?:ql)?\b/,'Administración en plataformas profesionales y laboratorio.'],
 ['SonarQube / Trivy',/\bsonarqube\b|\btrivy\b/,'Proyecto personal: controles de calidad y análisis de seguridad.'],
 ['Azure',/\bazure\b|\baks\b/,'Certificación Azure Fundamentals AZ-900; experiencia de producción en AKS por confirmar.'],
 ['AWS',/\baws\b|amazon web services/,'Formación AWS Academy Cloud Foundations; experiencia de producción por confirmar.']
];
const unknownSkills=[['Google Cloud',/\bgcp\b|google cloud/],['Go',/\bgolang\b|\bgo\b/],['Pulumi',/\bpulumi\b/],['Crossplane',/\bcrossplane\b/],['Datadog',/\bdatadog\b/],['Splunk',/\bsplunk\b/],['CKA / CKAD',/\bcka\b|\bckad\b/],['Certificación AWS',/aws certified|solutions architect associate/],['Certificación LPI',/certificacion.{0,20}lpic|lpic.{0,20}(obligatori|requerid)/]];
export function analyzeOffer(raw){
 const text=normalize(raw);const lines=raw.split(/[\n.!?;]+/).map(s=>s.trim()).filter(Boolean);
 const matches=skills.filter(s=>s[1].test(text)).map(([name,,evidence])=>({name,evidence}));
 const unknown=unknownSkills.filter(s=>s[1].test(text)).map(([name])=>name);
 const optional=s=>/deseable|valorable|opcional|nice.to.have|no (?:es )?(?:necesario|obligatorio)|no se requiere|no requerid/.test(s);
 const activeLines=lines.filter(s=>!optional(normalize(s)));
 const blockers=[];
 const onsite=activeLines.find(s=>{let n=normalize(s);return /\bhibrid[oa]\b|\bpresencial\b|on.site/.test(n)&&!/sin presencial|no presencial|100\s*%\s*(?:en\s*)?remot|presencialidad opcional/.test(n)});
 if(onsite)blockers.push({name:'Modalidad de trabajo',evidence:onsite,reason:'La oferta menciona presencialidad o modalidad híbrida. Mi preferencia actual es 100 % remoto.'});
 const english=activeLines.find(s=>{let n=normalize(s);return /ingles|english/.test(n)&&/\bb[12]\b|\bc[12]\b|fluido|fluent|obligatori|imprescindible|requerid|must|working language/.test(n)&&!/sin ingles|no.*(?:requiere|necesario|obligatorio).*ingles/.test(n)});
 if(english)blockers.push({name:'Idioma de trabajo',evidence:english,reason:'La oferta exige inglés. Actualmente busco puestos cuyo idioma de trabajo sea español.'});
 const requirements=activeLines.filter(s=>/obligatori|imprescindible|requisit|must|required|\d+\s*\+?\s*anos|experiencia minima/.test(normalize(s))).slice(0,8);
 let title=matches.length>=4?'Encaje técnico favorable':matches.length?'Encaje técnico parcial':'Información insuficiente';
 if(blockers.length)title='Condiciones incompatibles con mi búsqueda actual';
 return {title,matches,unknown,blockers,requirements};
}
const root=typeof document==='undefined'?null:document.getElementById('offer-match');
if(root){
 const area=root.querySelector('textarea'),file=root.querySelector('input[type=file]'),status=root.querySelector('[role=status]'),error=root.querySelector('[role=alert]'),result=root.querySelector('#offer-result');
 const setError=t=>{error.textContent=t;error.hidden=!t};
 const build=(tag,text,cls)=>{const el=document.createElement(tag);el.textContent=text;if(cls)el.className=cls;return el};
 const group=(title,rows)=>{const section=build('div','', 'offer-group');section.append(build('h4',title));if(!rows.length)section.append(build('p','No se han identificado menciones explícitas.','small'));else{const ul=document.createElement('ul');for(const row of rows){const li=document.createElement('li');li.append(build('strong',row.name),build('p',row.evidence));ul.append(li)}section.append(ul)}return section};
 root.querySelector('form').addEventListener('submit',e=>{e.preventDefault();setError('');const text=area.value.trim();if(text.length<80){setError('Añade una descripción de al menos 80 caracteres, con funciones y requisitos.');area.focus();return}if(text.length>60000){setError('La oferta supera los 60.000 caracteres. Conserva las funciones y requisitos principales.');return}const r=analyzeOffer(text);result.replaceChildren(build('span','VALORACIÓN ORIENTATIVA','eyebrow'),build('h3',r.title),build('p','Comparación por menciones explícitas con mi experiencia, formación y preferencias. No confirma todos los requisitos ni equivale a una evaluación profesional completa.','small'));
 if(r.blockers.length)result.append(group('Condiciones a revisar',r.blockers.map(x=>({name:x.name,evidence:x.reason+' Texto detectado: «'+x.evidence+'»'}))));
 result.append(group('Coincidencias con mi perfil',r.matches));
 result.append(group('Tecnologías o certificaciones sin acreditar en este CV',r.unknown.map(name=>({name,evidence:'No consta evidencia suficiente en el perfil publicado. Debe confirmarse en una conversación.'}))));
 result.append(group('Requisitos que requieren revisión humana',r.requirements.map(x=>({name:'Requisito detectado',evidence:x}))));
 result.append(build('p','Por confirmar en todos los casos: años por tecnología, profundidad técnica, responsabilidades, salario, disponibilidad y cualquier requisito no reconocido. La ausencia de una tecnología en este resultado no demuestra que se cumpla.','small'));
 const contact=build('a','Comentar la oferta ↗','btn primary');contact.href='mailto:migueags2@gmail.com?subject=Propuesta%20profesional';result.append(contact);result.hidden=false;status.textContent='Análisis actualizado.';result.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 });
 file.addEventListener('change',async()=>{setError('');result.hidden=true;const f=file.files[0];if(!f)return;if(f.size>5*1024*1024){setError('El archivo supera los 5 MB. Pega el texto o adjunta un documento más pequeño.');file.value='';return}const ext=f.name.split('.').pop().toLowerCase();status.textContent='Leyendo documento…';const submit=root.querySelector('[type=submit]');submit.disabled=true;try{let text='';if(['txt','md'].includes(ext))text=await f.text();else if(ext==='pdf'){const pdfjs=await import('./vendor/pdf.min.mjs');pdfjs.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdf.worker.min.mjs',import.meta.url).href;const pdf=await pdfjs.getDocument({data:await f.arrayBuffer(),isEvalSupported:false}).promise;try{if(pdf.numPages>30)throw Error('Utiliza un PDF de hasta 30 páginas.');for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);const content=await page.getTextContent();text+=content.items.map(x=>x.str+(x.hasEOL?'\n':' ')).join('')+'\n';if(text.length>60000)break}}finally{await pdf.destroy()}}else if(ext==='docx'){if(!window.mammoth)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='./vendor/mammoth.browser.min.js';script.onload=resolve;script.onerror=()=>reject(Error('No se ha podido cargar el lector DOCX. Pega el texto de la oferta.'));document.head.append(script)});text=(await window.mammoth.extractRawText({arrayBuffer:await f.arrayBuffer()})).value}else throw Error('Formato no compatible. Usa PDF, DOCX, TXT o MD.');if(text.trim().length<80)throw Error('No se ha podido extraer suficiente texto. Si es un escaneo, copia y pega la oferta manualmente.');if(text.length>60000)throw Error('El documento supera los 60.000 caracteres. Pega solo la oferta.');area.value=text;status.textContent='Documento leído. Revisa el texto y pulsa Analizar oferta.'}catch(e){setError(e.message||'No se ha podido leer el archivo. Copia y pega el texto.');status.textContent='';file.value=''}finally{submit.disabled=false}});
 root.querySelector('[data-clear-offer]').onclick=()=>{area.value='';file.value='';status.textContent='';setError('');result.hidden=true;result.replaceChildren();area.focus()};area.addEventListener('input',()=>{result.hidden=true;status.textContent=''});
}
