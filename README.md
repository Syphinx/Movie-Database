# Movie Database Project 

This repository hosts the implementation for the a movie database Project. This document will guide you on how to install, setup, and use the project.

## Table of Contents
- [Getting Started](#getting-started)
- [Application Overview](#application-overview)
  - [User Accounts](#user-accounts)
  - [Viewing Movies](#viewing-movies)
  - [Viewing People](#viewing-people)
  - [Viewing other Users](#viewing-other-users)
  - [Contributing Users](#contributing-users)
- [Design Critique](#design-critique)

## Getting Started

### Dependencies Installation
1. Navigate to the appropriate file directory in a CLI of your choosing.
2. Run the command `npm install` to install the necessary dependencies for this application.

### Database Setup
3. Run the command `mongod --dbpath=database` to connect to the database.
4. Initialize the base state of the server by running `npm run db`. This runs two database initialization scripts sequentially which create initial documents and precomputes some necessary information. (The 2500 Movie set may take some time to load)

### Server Launch
5. The server is launched by running the command `npm run start`.

### Account Creation
6. Upon opening the application, you will be greeted with the log in page. Navigate to the signup page by selecting the button, and enter details to create a new account.

## Application Overview
The following sections describe the functionalities of the application:

### User Accounts
The user account functionalities include the ability to log in and sign up, switch between regular and contributing user roles, subscribe to people and other users, manage a watchlist, receive recommendations and notifications, and search for movies.

### Viewing Movies
When viewing a movie page, basic information including title, release year, average reviewing rating, runtime and plot is displayed. Users can add the movie to their watchlist, view and submit reviews, and see similar movies.

### Viewing People
This feature allows users to access and navigate through pages dedicated to film crew members (directors, writers, actors). Users can view the full work history of a person, their most frequent collaborators, and subscribe to them.

### Viewing other Users
Users can view other users' profiles including their reviews, subscriptions, and watchlist. They can also subscribe to other users.

### Contributing Users
Contributing users can add new people or new movies to the database.

## Design Critique
This project uses ExpressJS for the backend, MongoDB for data storage and querying, and Tailwindcss for styling. It maintains a high code quality, clean, efficient, and effective. The application design closely follows the constraints of a RESTful system with a clear distinction between the server and client, stateless server, and a functional uniform interface.
