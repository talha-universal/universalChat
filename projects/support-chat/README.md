# SupportChat

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.0.0.


## Requirement
Install socket.io in your projectfor chat socket
Install firebase in your project  for FCM 
and  paste this code in you angular.json file assets array 

             {
                “glob”: “firebase-messaging-sw.js”,
                “input”: “node_modules/support-chat/firebase”,
                “output”: “/”
              }

## Code scaffolding

Run `ng generate component component-name --project supportChat` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project supportChat`.
> Note: Don't forget to add `--project supportChat` or else it will be added to the default project in your `angular.json` file. 

## Build

Run `ng build supportChat` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build supportChat`, go to the dist folder `cd dist/support-chat` and run `npm publish`.

## Running unit tests

Run `ng test supportChat` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
