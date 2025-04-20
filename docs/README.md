# theSobieCo
The Sobie Company DEVELOPMENT Platform 🪣

https://github.com/barrycumbie/theSobieCo/wiki/Sobie-Co.-Memo:-SPRING-'25

## Problem Statement
Regarding the #1, the team will consist of myself and Austin Moses.

4/3/25: Brainstorming on Login Issue<br>
4/8-22/25: Finalized ideas commence coding sessions<br>

The issue is that the SOBIE website lacks a login structured system approach for users like attendees/researchers/admin to establish a foundation of information to store, like user/password, manage profiles, registration, and research, and lacks web security.

![No-Login-System](/assets/login.jpeg) <br>
![No-Dashboard](/assets/no-dashboard.jpeg) <br>
![Undefined-Roles](/assets/undefined-roles.jpeg) <br>

## Objective
The main goal is to establish the requirements necessary based on the issue stated above and establish pages for login, profile (attendees, researchers, admin), registration, and research. Then, secure the software development against common HTML form vulnerabilities like Cross-Site Scripting (XSS), SQL Injections, Cross-Site Request Forgery (CSRF), Path Traversal, and DOM-based XSS.

## Proposal
The approach for the SOBIE webpage:

Home page (mission statement, history, etc) -> Make a hamburger menu that leads to the login page
Login page (username, password) - 2FA (accepted)-> goes to User Page/ or Admin Page | if no account -> (new) profile page (attendee, researcher) -> 2FA (email)
User Page (attendee, researcher) - > registration, research, information, account information
Admin Page information (view current users, registrants, contact information) (? MongoDB)

## 🐝 branches 

- `sobie2023` = old "scraped" front-end code (no .php stuff) from an old sobie year

![Flowchart](/assets/sobie-flowchart.jpeg)