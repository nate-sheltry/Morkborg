

//Classless module

let startingItems;
let item1;
let item2;
let item3;
let isScroll;

const items = []

async function getData(){
    let data = await fetch('./standard_module/items.json').then(result => {return result.json()});
    items.push(data)
}

getData();

function calcCarryCap(){
    return mainAttributes.Strength+8
}

function getStartItem(roll, itemList){
    let quantity = 0;
    let attribute = '';
    switch(itemList){
        case 0:
            switch(roll){
                case 0:
                case 1:
                    break;
                default:
                    quantity = 1;
                    break;
            }break;
        case 1:
            switch(roll){
                case 1:
                case 6:
                    quantity = mainAttributes.Presence + 4;
                    break;
                case 2:
                    attribute = `Hours: ${mainAttributes.Presence + 6}`;
                    quantity = 1;
                    break;
                case 10:
                    quantity = rollDie(4);
                    break;
                default:
                    quantity = 1;
                    break;
            }break;
        case 2:
            switch(roll){
                case 3:
                    attribute = `HP: ${rollDie(4)+2}`;
                case 0:
                    quantity = rollDie(4);
                    break;
                case 2:
                    attribute = `HP: ${rollDie(6)+2}`;
                    quantity = 1;
                    break;
                default:
                    quantity = 1;
                    break;
            }break;
    }
    let item = items[0].starting_equipment[itemList][roll].name;
    let desc = items[0].starting_equipment[itemList][roll].desc;

    if(item == undefined)
        return [undefined, undefined]
    if(desc == '')
        return [`${quantity}.`, `${item}`]
    if(attribute == '')
        return [`${quantity}.`, `${item}${desc}`]
    return [`${quantity}.`, `${item}${desc} - ${attribute}`]
}

function getStartingEquipment(scrollsAllowed){
    isScroll = false;
    item1 = getStartItem(rollDie(6)-1, 0)
    item2 = getStartItem(rollDie(12)-1, 1)
    if(scrollsAllowed){
        if(hasScroll(item2)){
            item2 = decideScroll(item2)
            isScroll = true;
        }
        item3 = getStartItem(rollDie(12)-1, 2)
        if(hasScroll(item3)){
            item3 = decideScroll(item3)
            isScroll = true;
        }
    }
    else {
        if(hasScroll(item2)){
            item2 = getStartItem(rollDie(12)-1, 1)
        }
        if(hasScroll(item2)){item2 = [undefined, undefined]}
        item3 = getStartItem(rollDie(12)-1, 2)
        if(hasScroll(item3)){
            item3 = getStartItem(rollDie(12)-1, 2)
        }
        if(hasScroll(item3)){item3 = undefined, undefined}
    }
    startingItems = [item1, item2, item3]
    return startingItems;
}

function hasScroll(item){
    let scroll = false;
    if(item[1].toLowerCase().includes('scroll')){
        scroll = true;
    }
    return scroll;
}

function decideScroll(item){
    let scroll;
    if(item[1].toLowerCase().includes('unclean')){
        scroll = items[0].scrolls.unclean[rollDie(10)-1]
    }
    else if(item[1].toLowerCase().includes('sacred')){
        scroll = items[0].scrolls.sacred[rollDie(10)-1]
    }
    return [`1.`, `${scroll.name}:${scroll.desc}`];
}

function getArmor(){
    let scroll = isScroll;
    if(scroll)
        return items[0].armor[rollDie(2)-1]
    return [items[0].armor[rollDie(4)-1]]
}

function getWeapon(){
    let weapon;
    let scroll = isScroll;
    if(scroll){
        weapon = items[0].weapons[rollDie(6)-1]
    }
    else{
        weapon = items[0].weapons[rollDie(10)-1]
        if(weapon.ammo != undefined)
            weapon.amount = parseInt(parseInt(mainAttributes[weapon.modifier]) + parseInt(weapon.amount))
    }
    return [weapon];
}

function fangedDeserterItem(equipment, weapons){
    let index = rollDie(6)-1;
    let classItem = items[0].fanged_deserter.starting_items[index]
    if(classItem.hasOwnProperty('damage')){
        weapons.push(classItem)
        return
    }
    let quantity;
    switch(index){
        case 2:
            quantity = 4;
            break;
        default:
            quantity = 1
            break;
    }
    classItem = [`${quantity}.`, `${classItem.name}${classItem.desc}`];
    equipment.push(classItem);
}

function noClassAttributes(){
    let array = [];let attributes = [];
    for(let i = 0; i < 4; i++){
        array.push(rollDie(6))
    }
    array.sort();
    array.shift();

    attributes.push(array.reduce((accumulator, value) => accumulator += value, 0))
    array = [];
    for(let i = 0; i < 4; i++){
        array.push(rollDie(6))
    }
    array.sort();
    array.shift();

    attributes.push(array.reduce((accumulator, value) => accumulator += value, 0))
    attributes.push(rollDice('3d6'));attributes.push(rollDice('3d6'));
    mainAttributes.Omens = rollDie(2);
    inventory.silver = rollDice('2d6')*10;
    inventory.food = rollDie(4);
    for(let i = attributes.length - 1; i > 0; i--){
        let z = rollDie(4)-1;
        [attributes[i], attributes[z]] = [attributes[z], attributes[i]]
    }
    determineAttributes(attributes);
    mainAttributes.HitPoints = mainAttributes.Toughness + rollDie(8);
    if(mainAttributes.HitPoints < 1)
        mainAttributes.HitPoints = 1;
    inventory.carryCapacity = mainAttributes.Strength + 8;
    displayAttributes();
    let equipment = getStartingEquipment();
    let weapons = getWeapon();
    let armor = getArmor()
    displayEquipment(equipment, weapons, armor);
}

function fangedDeserter(){
    let attributes = [];
    for(let i = 0; i < 4; i++){
        attributes.push(rollDice('3d6'))
    }
    attributes[0] = attributes[0] + 2;
    attributes[1] = attributes[1] - 1;
    attributes[2] = attributes[2] - 1;
    mainAttributes.Omens = rollDie(2);
    inventory.silver = rollDice('2d6')*10;
    inventory.food = rollDie(4);
    determineAttributes(attributes);
    mainAttributes.HitPoints = mainAttributes.Toughness + rollDie(10);
    if(mainAttributes.HitPoints < 1)
        mainAttributes.HitPoints = 1;
    inventory.carryCapacity = mainAttributes.Strength + 8;
    displayAttributes();
    let equipment = getStartingEquipment();
    let weapons = getWeapon();
    let armor = getArmor()
    fangedDeserterItem(equipment, weapons)
    displayEquipment(equipment, weapons, armor);
} 