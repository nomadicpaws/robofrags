const storeConfig = {
  email: "",
  website: "",
  checkout: {}
};

const notes = ["Bergamot","Black pepper","Juniper","Lavender","Sage","Cinnamon","Cedar","Amber","Vetiver"];
const wear = ["Everyday","Evening","Outdoors"];
const men = [
  ["Black","Woody","Dry woods, cracked pepper, and the earthy hush of an old cabinet.",[1,4,6],1],
  ["Copper Coil","Amber","Warm spice with a slow amber glow.",[1,5,7],1],
  ["Green Relay","Aromatic","Crushed juniper on a cool morning.",[2,4,8],2],
  ["Daybreak","Fresh","A bright citrus opening over clean, dry roots.",[0,3,8],0],
  ["Oak Cabinet","Woody","The dry scent of a cabinet that once held herbs.",[2,4,6],0],
  ["Ember Glass","Amber","Cinnamon warmth and resin after dark.",[0,5,7],1],
  ["Stillroom","Aromatic","Soft lavender, silver sage, and dry cedar.",[2,3,6],0],
  ["Open Circuit","Fresh","Citrus and juniper out in the cold air.",[0,2,8],2],
  ["Rafter","Woody","Pepper over timber and dark roots.",[1,6,8],2],
  ["Brass Weight","Amber","A bright opening that settles into gold.",[0,3,7],0],
  ["Sage Ledger","Aromatic","Green leaves with a trace of warm spice.",[1,4,7],1],
  ["Cold Bench","Fresh","A clean green breeze through the workshop.",[0,4,6],0],
  ["Ground Wire","Woody","Earthy vetiver with a dry snap of juniper.",[2,1,8],2]
].map(([name,family,line,accords,occasion], i)=>({name,family,line,accords,occasion,id:i===0?"black":name.toLowerCase().replaceAll(" ","-")}));
const women = Array.from({length:12},(_,i)=>({name:"Fragrance slot " + (i+1),line:"Release details pending."}));
const get = (id) => document.getElementById(id);
const details = (s) => s.id + ".html";
const read = (key, fallback) => {
  try {return JSON.parse(localStorage.getItem(key)) ?? fallback;} catch {return fallback;}
};
const write = (key,value) => {try {localStorage.setItem(key,JSON.stringify(value));} catch {}};
let bag = read("robofrags-bag",[]);
const ratings = read("robofrags-ratings",{});
const modal = get("modal");
const modalBody = get("modal-content");
const show = (html) => {modalBody.innerHTML=html;if(!modal.open)modal.showModal();};
const nameOf = (s) => s.id === "black" ? "Robofrags Black" : s.name;
const noteList = (s) => s.accords.map(i=>notes[i]).join(" · ");
const specimenPosition = (index) => ((index % 3) * 50) + "% " + (Math.floor(index / 3) * 50) + "%";
function card(s) {
  const featured = s.id === "black";
  return '<article class="fragrance-card' + (featured ? ' feature' : '') + '">' +
    '<div aria-hidden="true" class="card-art specimen" style="background-position:' + specimenPosition(s.accords[0]) + '"></div>' +
    '<div class="card-copy"><p class="kicker">' + s.family + (featured ? ' · No. 1 best seller' : '') + '</p>' +
    '<h3><a href="' + details(s) + '">' + nameOf(s) + '</a></h3><p>' + s.line + '</p>' +
    '<p class="card-notes">' + noteList(s) + '</p></div>' +
    '<div class="card-actions"><a class="button" href="' + details(s) + '" aria-label="View fragrance: ' + nameOf(s) + '">View fragrance</a>' +
    '<button class="outline" data-add="' + s.id + '" aria-label="Add to bag: ' + nameOf(s) + '">Add to bag</button></div></article>';
}
function updateCount(){get("count").textContent=bag.length;write("robofrags-bag",bag);}
function add(item){bag.push(item);updateCount();renderBag();}
function renderBag(){
  show('<h2>Your bag</h2>'+(bag.length?'<ul class="bag-list"></ul>':'<p>Your bag is empty.</p>')+(bag.length?'<p>Use a product’s payment link once it is available.</p>':''));
  const list=modalBody.querySelector("ul");
  bag.forEach((item,i)=>{
    const row=document.createElement("li");
    const label=document.createElement("span");
    label.textContent=item.label;
    const remove=document.createElement("button");
    remove.className="outline";
    remove.textContent="Remove";
    remove.onclick=()=>{bag.splice(i,1);updateCount();renderBag();};
    row.append(label,remove);
    const url=storeConfig.checkout[item.id];
    if(url){const pay=document.createElement("a");pay.href=url;pay.textContent="Pay for this item";row.append(pay);}
    list.append(row);
  });
}
get("bag").onclick=renderBag;
updateCount();
document.addEventListener("click", (event) => {
  const id = event.target.closest("[data-add]")?.dataset.add;
  if (!id) return;
  const scent = men.find((item) => item.id === id);
  add({ id, label: nameOf(scent) });
});
function renderHome(){
  const filter=get("filter");
  const render=()=>{get("catalog").innerHTML=men.filter(s=>filter.value==="All"||s.family===filter.value).map(card).join("");};
  filter.onchange=render;
  render();
  get("women-catalog").innerHTML=women.map(s=>"<article><h3>"+s.name+"</h3><p>"+s.line+"</p></article>").join("");
  const form=get("sample-form");
  get("choices").innerHTML=men.map(s=>'<label><input type="checkbox" name="sample" value="'+s.id+'"> '+nameOf(s)+'</label>').join("");
  const selected=()=>[...new FormData(form).getAll("sample")];
  form.onchange=()=>{
    const count=selected().length;
    form.querySelectorAll("input").forEach(input=>input.disabled=count===3&&!input.checked);
    get("sample-status").textContent=count+" of 3 selected";
  };
  form.onsubmit=(e)=>{
    e.preventDefault();
    const ids=selected();
    if(ids.length!==3){get("sample-status").textContent="Choose exactly three fragrances.";return;}
    add({id:"discovery",label:"Discovery set · "+ids.map(id=>nameOf(men.find(s=>s.id===id))).join(", ")});
  };
  get("quiz").onsubmit=(event)=>{
    event.preventDefault();
    const data=new FormData(event.target);
    const candidates=men.filter(s=>s.family===data.get("family"));
    const match=candidates.find(s=>wear[s.occasion]===data.get("wear"))||candidates[0];
    get("match").innerHTML='Try <a href="'+details(match)+'">'+nameOf(match)+'</a>. '+match.line;
  };
}
const levels=["Skin scent","Soft","Moderate","Strong","Beast mode"];
function robot(level){
  const circles=Array.from({length:level+1},(_,i)=>'<ellipse cx="50" cy="44" rx="'+(18+i*6)+'" ry="'+(18+i*4)+'" fill="none" stroke="#9a7653" stroke-dasharray="3 5"/>').join("");
  return '<svg viewBox="0 0 100 90" aria-hidden="true">'+circles+'<path d="M37 52V29a13 13 0 0 1 26 0v29a9 9 0 0 1-18 0V33a5 5 0 0 1 10 0v22" fill="none" stroke="#e8bc86" stroke-width="4" stroke-linecap="round"/><path d="M50 16v-5m-14 29-7 5m35-5 7 5m-27 23-6 7m17-7 6 7" stroke="#e8bc86" stroke-width="2" stroke-linecap="round"/><circle cx="47" cy="25" r="1.5" fill="#f7e9d8"/><circle cx="54" cy="25" r="1.5" fill="#f7e9d8"/></svg>';
}
function renderProduct(s){
  const tier=["Top note","Heart note","Base note"];
  const notePanels=s.accords.map((idx,i)=>'<figure class="note"><p class="kicker">'+tier[i]+'</p><div class="specimen" style="background-position:'+((idx%3)*50)+'% '+(Math.floor(idx/3)*50)+'%"></div><figcaption>'+notes[idx]+'</figcaption></figure>').join("");
  get("product").innerHTML='<a href="index.html#collection">Men’s fragrance</a><p class="kicker product-kicker">'+s.family+(s.id==="black"?' · No. 1 best seller · Sold out twice':'')+'</p><h1 class="product-h">'+nameOf(s)+'</h1><p class="lead">'+s.line+'</p><p>Preview scent profile. Notes and performance are subject to confirmation.</p><div class="product-grid"><div><h2>Scent notes</h2><div class="notes">'+notePanels+'</div><h2>Wear and performance</h2><div class="metrics"><div class="metric"><b>Longevity</b><p>Wear test pending</p></div><div class="metric"><b>Projection</b><p>Wear test pending</p></div><div class="metric"><b>Suggested wear</b><p>'+wear[s.occasion]+'</p></div></div><h3>Projection scale</h3><p>How far a fragrance can be noticed around you.</p><div class="scale">'+levels.map((label,i)=>'<figure>'+robot(i)+'<figcaption>'+label+' <small>'+(i+1)+'/5</small></figcaption></figure>').join("")+'</div><section id="rating"><h2>Fragrance rating</h2><form id="rate"><label>Your rating <select name="score" required><option value="">Choose a rating</option>'+levels.map((_,i)=>'<option value="'+(i+1)+'">'+(i+1)+' / 5</option>').join("")+'</select></label><button class="button">Save rating</button></form><p id="rating-status" aria-live="polite"></p></section></div><aside class="purchase"><h3>Purchase</h3><p>'+noteList(s)+'</p><p>Longevity and projection results pending. Suggested wear: '+wear[s.occasion]+'.</p><button class="button" id="add">Add to bag</button><p id="payment"></p><a href="#rating">Rate this fragrance</a></aside></div>';
  const next = men[men.indexOf(s) + 1];
  const browse = document.createElement("nav");
  browse.className = "circuit-nav product-circuit";
  browse.setAttribute("aria-label", "Continue exploring");
  browse.innerHTML = '<a class="circuit-link" href="index.html#collection"><strong>Collection</strong><span>Browse all fragrances</span></a>' +
    (next ? '<a class="circuit-link" href="'+details(next)+'"><strong>Next fragrance</strong><span>'+nameOf(next)+'</span></a>' : '') +
    '<a class="circuit-link" href="index.html#archive"><strong>History</strong><span>Follow the timeline</span></a>';
  get("product").append(browse);
  const url=storeConfig.checkout[s.id];
  if(url){const pay=document.createElement("a");pay.className="button";pay.href=url;pay.textContent="Continue to payment";get("payment").append(pay);}
  else get("payment").textContent="Online checkout is pending.";
  get("add").onclick=()=>add({id:s.id,label:nameOf(s)});
  const renderRating=()=>{get("rating-status").textContent=ratings[s.id]?"Your saved rating on this device: "+ratings[s.id]+"/5.":"No rating saved on this device.";};
  renderRating();
  get("rate").onsubmit=(e)=>{e.preventDefault();ratings[s.id]=new FormData(e.target).get("score");write("robofrags-ratings",ratings);renderRating();};
}
if(get("home"))renderHome();
else {
  const scent=men.find(s=>s.id===get("product")?.dataset.id);
  if(scent)renderProduct(scent);
}
