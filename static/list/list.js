import { List } from "./list_component.js";
import { API_BASE } from "../utilities/constants.js";


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

export const showList= async (location)=>{
  const listObjects =[]
  getLists().then((r)=>{
    Object.entries(r).forEach(([key, items])=>{
      listObjects.push(List(items, key, key))
    })

  });
  // const all_lists = [];
  // lists.forEach(l => {
  //   console.log(l)
  // });
//   console.log(lists);

//   const lista = lists["colors"];
//   console.log(lista);

const devLocation = document.getElementById(location);
devLocation.replaceChildren(...listObjects);
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