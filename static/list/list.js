import { List } from "./list_component.js";
import { API_BASE } from "../utilities/constants.js";
import { showPopup } from "../utilities/popup.js";


const getLists =()=>{
  return fetch(`${API_BASE}/list`,{
          method: "GET"
      }).then((r)=>{
          if(!r.ok){
              throw new Error("failed to update")
          }
      return r.json()         
  
      }).catch((e)=>{
          showPopup('error', 'Something failed:', `${e}`);
      }).finally(()=>{

      })

}
export function createList() {
    let newList = {}
    newList.name = prompt('List name:');
    if(!newList.name){
      return;
    }
    let item = prompt('would you like to add items to the list. :');
    while (item) {
      if(newList.items){
        newList.items.push(item);
      }else{
        newList.items = [item];
      }
    }
        fetch(`${API_BASE}/list`,{
            method: "POST"
            ,headers:{"Content-Type":"application/json"}
            , body:JSON.stringify(newList)
        }).then((r)=>{
            showPopup('success', 'Your List Has been created', 'good for you');
        }).catch((e)=>{
            showPopup('error', 'Something failed:', `${e}`);
        })
    renderIndependentTasksList()   
        
    
}
export const showList= async (location)=>{
  const listObjects =[]
  getLists().then((r)=>{
    Object.entries(r).forEach(([key, items])=>{
      listObjects.push(List(items, key, key))
      const devLocation = document.getElementById(location);
      devLocation.replaceChildren(...listObjects);
    })

  });

}

// Usage examples:
/*
// Simple string array
const simpleList = List(["Item 1", "Item 2", "Item 3"], "My Tasks");

// Object array with IDs
const objectList = List([
  { text: "Task 1", id: "task-1" },
  { text: "Task 2", id: "task-2", className: "priority-high" },
  { text: "Task 3", id: "task-3" }
], "Priority Tasks");

// Empty list
const emptyList = List([], "Empty List");

// Append to DOM
document.body.appendChild(simpleList);
*/