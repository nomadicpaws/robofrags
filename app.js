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
}

function bindFinder(){
  const result = get("match");
  const stages = ["opening","heart","finish"];
  get("quiz").addEventListener("submit", event => {
    event.preventDefault();
    const answers = new FormData(event.target);
    const preferredStage = {Opening:"opening", Heart:"heart", Finish:"finish"}[answers.get("priority")];
    const ranked = men.map(scent => {
      let score = scent.family === answers.get("family") ? 4 : 0;
      if (wear[scent.occasion] === answers.get("wear")) score += 3;
      const matchedNotes = scent.accords.map(index => notes[index]).filter((note,index) => {
        const stage = stages[index];
        const matches = note === answers.get(stage);
        if (matches) score += stage === preferredStage ? 4 : 2;
        return matches;
      });
      return {scent, score, matchedNotes};
    }).sort((a,b) => b.score - a.score);
    const matches = ranked.filter(entry => entry.score > 0).slice(0,3);
    const suggestions = matches.length ? matches : ranked.slice(0,3);
    result.innerHTML = "<h2>"+(matches.length ? "Your scent matches" : "Start with these fragrances")+"</h2>"+
      "<ul>"+suggestions.map(({scent,matchedNotes}) => "<li><h3><a href='"+details(scent)+"'>"+nameOf(scent)+"</a></h3><p>"+scent.line+
        "</p><p>"+scent.family+" · "+wear[scent.occasion]+(matchedNotes.length ? " · Matches your notes: "+matchedNotes.join(", ") : "")+"</p></li>").join("")+"</ul>";
    result.hidden = false;
    result.focus();
  });
}

function bindStore(){
  const filter = get("filter");
  const cards = [...get("catalog").children];
  filter.addEventListener("change", () => {
    cards.forEach(card => { card.hidden = filter.value !== "All" && card.dataset.family !== filter.value; });
  });
  get("women-catalog").innerHTML = women.map(s => "<article><h3>"+s.name+"</h3><p>"+s.line+"</p></article>").join("");
}
function bindProduct(){
  const id = get("product").dataset.id;
  const url = storeConfig.checkout[id];
  if (url) {
    const pay = document.createElement("a");
    pay.href = url;
    pay.className = "button";
    pay.textContent = "Continue to payment";
    get("payment").replaceChildren(pay);
  }
  const renderRating = () => {
    get("rating-status").textContent = ratings[id] ? "Your saved rating on this device: " + ratings[id] + "/5." : "No rating saved on this device.";
  };
  renderRating();
  get("rate").addEventListener("submit", event => {
    event.preventDefault();
    ratings[id] = new FormData(event.target).get("score");
    write("robofrags-ratings", ratings);
    renderRating();
  });
}
if (get("home")) renderHome();
if (get("store")) bindStore();
if (get("product")) bindProduct();

if (get("quiz")) bindFinder();
