# Tasks Project

A lightweight task and note management web application built with vanilla JavaScript, HTML, and CSS. This project allows users to create, view, and manage tasks with associated notes in a clean, interactive interface.

## Features

- **Task Management**: Create and view tasks with details like title, description, and status.
- **Note Component**: Each task can have associated notes; notes are displayed in styled, read-only or editable text areas.
- **Dynamic UI**: Tasks and notes are rendered dynamically using JavaScript DOM manipulation.
- **Flexible Layouts**: Uses CSS Flexbox for arranging elements with precise width ratios.
- **Editable and Read-Only Notes**: Notes can be created as editable or read-only, depending on use-case.


## Installation
example instructions for begginers: all commmands to be run in powershell, look up equivalent commands in other terminals  
1. Clone the repository:
    ```git clone https://github.com/mujolocal/projectTracker```
2. Go into the files that have been created:
    ```cd projectTracker```
3. make sure you have an appropriate python version i used python 3.11, but i deployed in 3.10 so both should work:
    ```python --version```
4. Create a virtual env this is just so you dont mess up your global env:
    ```python -m venv venv ```
5. Activate that environment:
    ```.\venv\Scripts\activate```
6. Install the python requirements (this file only lists the major requirements, there will be probably 10 other things downloaded):
    ```pip install -r .\requirements_file.txt```
7. Run the application (to run the app and have it automatically update everytime you update the files) terminal will be occupied  
   after this:
    ```uvicorn main:app --reload```
8. go to your browser. go into the projectTracker folder, go into the static folder. Then open index.html in a broswer... usually by 
   double clicking
    


## Usage
0.  The Db is sqlite, its saved on your computer... if you want you can easily deploy this application and have access to it from 
    anywhere. 
00. you may be need click the refresh button, i have not implimented it.... lets say to save data... but really cause i couldnt 
    figure out how to do it without breaking an abstraction i didnt want to break
1.  you can crate new tasks by clicking the new task button. a simple set of queries will popup and when you finish it will be added 
    to the db. Tasks are semi immutable. 
2.  add a note to each of the tasks. notes are time stamped with the date they are created and are immutable... unless you go to the 
    db... or python. the notes are created when the update task button is clicked
3.  Notes appear in reverse cronoligcal order, with the newests one up top right below the create new note section
4.  name and description are not changeable.
5.  the status can be updated by clicking the status dropdown and selecting the status of the project.
    tasks that are set to completed no longer appear on the tasklist
6.  




