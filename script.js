
//Load alternate style file for Mozilla
function loadStyleSheet(url){
    let link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url
    document.head.appendChild(link)
}
let isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
let isFirefox = typeof InstallTrigger !== 'undefined';
let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

if(isFirefox)
    loadStyleSheet('mozilla_style.css?' + `${Date.now()}`);
else if(isChrome)
    loadStyleSheet('style.css?' + `${Date.now()}`);
else
    loadStyleSheet('style.css?' + `${Date.now()}`);


//
const __attributes = document.querySelectorAll(".attribute")
const __carryCap = document.querySelector('#carry_capacity').children[0];
const __equipment = document.querySelector('#equipment').children[1];
const __weapon = document.querySelector('#weapon');
const __armor = document.querySelector('#armor');
const __class = document.querySelector('#class');

const __charInfo = document.querySelector('#character_info_container').children[1];

const __footer = document.querySelector('#footer_bar')

let touchStartY;
let touchDeltaY;
let touchTimeStart = null;
let touchTimeEnd = null;


const classes = {}

//Necessary Functions for controlling touchscreen scrolling and creating the horizontal scroll effect.
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}
function handleTouchStart(event) {
    if(event.pointerType === 'touch'){
        touchTimeStart = new Date().getTime();
        return true;
        //if(event.touches){touchStartY = event.touches[0].clientY;}
    }
    return false;
}
/*
function handleTouchMove(event) {
    touchDeltaY = touchStartY - event.touches[0].clientY;
}*/
function handleTouchEnd(){
    if(touchTimeStart != null){
        const touchEndTimestamp = new Date().getTime();
        const touchDuration = touchEndTimestamp - touchTimeStart;
        if(touchDuration < 1000){
            touchTimeStart = null;
            return true;
        }
        touchTimeStart = null;
        return false;
    }
    return false;
}
  
//document.addEventListener('touchstart', (e) => {handleTouchStart(e)});
//document.addEventListener('touchmove', (e) => {handleTouchMove(e)});

const __horizontalScrollContainer = document.querySelector('#horizontal-container');

let inventory = {silver: 0, food: 0, carryCapacity: 0, container: {}}

let mainAttributes = {HitPoints: 0, Omens: 0, Strength: 0, Agility: 0, Presence: 0, Toughness: 0}

function displayAttributes(){
    __attributes[0].textContent = mainAttributes.HitPoints
    __attributes[1].textContent = mainAttributes.Omens
    for(let i = 2; i < 8; i++){
        let stat;
        if(!Object.keys(mainAttributes)[i]){
            stat = inventory[Object.keys(inventory)[i-6]];
        }
        else{
            stat = mainAttributes[Object.keys(mainAttributes)[i]];
            if(stat < 1 && stat > -1)
                stat = `&ensp;0`;
            else if(stat > 0)
                stat = `+${stat}`;
        }
        __attributes[i].innerHTML = DOMPurify.sanitize(stat);
    }
    __carryCap.children[0].childNodes[2].textContent = inventory.carryCapacity;
}

function displayEquipment(equipment, weapons, armors, charInfo){
    //Starting Items
    if(__equipment.children.length > 1){
        for(let i = __equipment.children.length-1; i > 0; i--){
            __equipment.children[i].remove()
        }
    }
    for(let i = 0; i < equipment.length; i++){
        if(equipment[i][0] == undefined && equipment[i][1] == undefined)
            continue;
        let paragraph = document.createElement('p');
        let numbering = document.createElement('span');
        numbering.textContent = equipment[i][0];
        paragraph.innerHTML = DOMPurify.sanitize(equipment[i][1]);
        paragraph.insertBefore(numbering, paragraph.firstChild);
        __equipment.appendChild(paragraph);
    }
    //Weapon
    if(__weapon.children.length > 1){
        for(let i = __weapon.children.length-1; i > 1; i--){
            __weapon.children[i].remove()
        }
    }
    weapons.forEach(weapon =>{
        let div = document.createElement('div')
        div.classList.toggle('character_info')
        let name = document.createElement('p')
        let paragraph;
        name.textContent = weapon.name;
        div.appendChild(name);
        if(weapon.ammo != undefined){
            paragraph = document.createElement('p');
            let ammoText = document.createElement('span');
            ammoText.textContent = 'Ammunition';
            if(weapon.amount == undefined){
                paragraph.textContent = `${weapon.ammo}`;
            }
            else{paragraph.textContent = `${weapon.ammo} ${weapon.amount}`;}
            paragraph.insertBefore(ammoText, paragraph.firstChild);
            div.appendChild(paragraph);
        }
        paragraph = document.createElement('p');
        let title = (document.createElement('span')); title.textContent = `Damage Die`;
        paragraph.textContent = `${weapon.damage}`;
        paragraph.insertBefore(title, paragraph.firstChild);
        div.appendChild(paragraph)
        if(weapon.hasOwnProperty('effect')){
            paragraph = document.createElement('p');
            let effectName = document.createElement('span');
            effectName.textContent = `Description`
            paragraph.textContent = weapon.effect
            paragraph.insertBefore(effectName, paragraph.firstChild);
            div.appendChild(paragraph)
        }
        __weapon.appendChild(div)
    })
    //Armor
    if(__armor.children.length > 1){
        for(let i = __armor.children.length-1; i > 0; i--){
            __armor.children[i].remove()
        }
    }
    armors.forEach(armor => {
        let div = document.createElement('div')
        div.classList.toggle('character_info')
        let name = document.createElement('p')
        name.textContent = armor.name;
        div.appendChild(name);
        if(armor.damage_reduction != ""){
            let paragraph = document.createElement('p');
            let damageResTitle = document.createElement('span');
            damageResTitle.textContent = 'Damage Reduction';
            paragraph.textContent = `${armor.damage_reduction}`;
            paragraph.insertBefore(damageResTitle, paragraph.firstChild);
            div.appendChild(paragraph);
        }
        __armor.appendChild(div)
    })
    //Character Information
    for(let i = 0; i < __charInfo.children.length; i++){
        let object = __charInfo.children[i]
        for(let i = object.childNodes.length-1; i > 0; i--){
            object.childNodes[i].remove()
        }
        if(!charInfo[i]){
            object.innerHTML += DOMPurify.sanitize("N/A");
            continue;
        }
        charInfo[i].forEach(value => {
            object.innerHTML += DOMPurify.sanitize(value);
        })
        if(object.innerHTML[object.innerHTML.length -2] == ','){
            let string = object.innerHTML;
            string = string.slice(0, string.length-2) + '.'
            object.innerHTML = DOMPurify.sanitize(string);
        }
    }

}

function rollDie(max, min = 1){
    let time = new Date()
    let roll = Math.floor(Math.random(time) * max) + min
    delete(time)
    return roll
}
function rollDice(dice){
    let parameters = dice.split('d')
    let total = 0;
    for(let i = 0; i < parseInt(parameters[0]); i++){
        total += rollDie(parseInt(parameters[1]))
    }
    return total;
}

function determineAttributes(attributes){
    const modifierRangeMap = {
        '1-4':-3,
        '5-6':-2,
        '7-8':-1,
        '9-12':0,
        '13-14':+1,
        '15-16':+2,
        '17-20':+3,
    }
    const stats = attributes.map(value => {
        for (const range in modifierRangeMap){
            const [min, max] = range.split('-').map(Number);
            if(value >= min && value <= max)
                return modifierRangeMap[range];
        }
        return value
    });
    mainAttributes.Strength = stats[0];mainAttributes.Agility = stats[1];
    mainAttributes.Presence = stats[2];mainAttributes.Toughness = stats[3];
}

function selectRandomClass(){
    let ranNum = rollDie(2)-1;
    let className;
    switch(ranNum){
        case 0:
            noClassAttributes()
            className = "Classless"
            break;
        case 1:
            fangedDeserter()
            className = "Fanged Deserter"
            break;
    }
    __class.children[0].children[1].textContent = className;
}
function startOpen(e){
    if(!handleTouchStart(e))
        e.target.parentElement.children[1].classList.toggle('display-flex', !e.target.parentElement.children[1].classList.contains('display-flex'))
}
function openDiv(e){
    if(handleTouchEnd()){
        for(let i = 1; i < e.target.parentElement.children.length; i++){
            e.target.parentElement.children[i].classList.toggle('display-flex', !e.target.parentElement.children[i].classList.contains('display-flex'))
        }
    }
    if(e.target.parentElement.children[1].classList.contains('display-flex')){
        e.target.parentElement.style.borderBottomLeftRadius = '0px';
        e.target.parentElement.style.borderBottomRightRadius = '0px';
    }
    else if(!e.target.parentElement.children[1].classList.contains('display-flex')){
        e.target.parentElement.style.borderBottomLeftRadius = '4px';
        e.target.parentElement.style.borderBottomRightRadius = '4px';
    }
}

__charInfo.parentElement.children[0].addEventListener('pointerdown', startOpen);
__charInfo.parentElement.children[0].addEventListener('pointerup', openDiv);
__equipment.parentElement.children[0].addEventListener('pointerdown', startOpen);
__equipment.parentElement.children[0].addEventListener('pointerup', openDiv);
__weapon.children[0].addEventListener('pointerdown', startOpen);
__weapon.children[0].addEventListener('pointerup', openDiv);
__armor.parentElement.children[0].addEventListener('pointerdown', startOpen);
__armor.parentElement.children[0].addEventListener('pointerup', openDiv);