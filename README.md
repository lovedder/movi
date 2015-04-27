# Movi
Una librería para enlazar objetos de JavaScript con documentos HTML

# El modelo y la vista son lo mismo
Esta librería implementa una nueva variación del arquetipo Modelo-Vista-Vista-Modelo (MVVM). Ha esta variación la he llamado Abstacción-Modelo-Vista (AMV).

El arquetipo AMV consiste en tratar el modelo y la vista de manera análoga. La analogía que hay entre el modelo (JavaScript) y la vista (HTML) es su encomienda al enlazarlos: Representar un objeto. Esta representación es la abstracción en el arquetipo.

Así que al igual que en JavaScript donde los objetos pasan por referencia, en este arquetipo la abstracción pasa por referencia en el modelo y la vista.

```js
let product = {
    name: "Chile",
    price: 6
};

let model = product;
let view = product;

model.name = "cebolla";
view.price = 7;

model === view; // true

/*
product === {
    name: "Cebolla",
    price: 7
}
*/
```

# Instalación
```js
jspm install github:lovedder/movi
```

# Implementación
Ejemplo: Quieres implementar la siguiente abstracción:
```js
var product = {
    name: "Aguacate",
    price: 43
}
```

Solo tienes que declararla de manera implícita en la vista y/o el modelo.

Implícita en el modelo
```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title></title>
    </head>
    <body>

        <form>
            <input data-bind="value: App.product.name">
            <input data-bind="value: App.product.price">
            <button>Create</button>
        </form>

        <script src="jspm_packages/system.js"></script>
        <script src="config.js"></script>
        <script>
            var App = {
                product: {
                    name: "Aguacate",
                    price: 43
                }
            };

            System.import("lovedder/movi").then(function(movi) {
                movi.bindData();
            });
        </script>
    </body>
</html>
```

Implícita en el vista
```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title></title>
    </head>
    <body>

        <form>
            <input data-bind="value: App.product.name" value="Aguacate">
            <input data-bind="value: App.product.price" value="43">
            <button>Create</button>
        </form>

        <script src="jspm_packages/system.js"></script>
        <script src="config.js"></script>
        <script>
            System.import("lovedder/movi").then(function(movi) {
                movi.bindData();
            });

            /*
            App === {
                product: {
                    name: "Aguacate",
                    price: "43"
                }
            };
            */
        </script>
    </body>
</html>

El modelo siempre superpondrá la vista y si algo esta declarado solo en la vista se tomará el valor del primer elemento analizado. Por ejemplo:

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title></title>
    </head>
    <body>

        <form>
            <input data-bind="value: App.product.name" value="Aguacate">
            <input data-bind="value: App.product.price" value="43">
            <button>Create</button>
        </form>

        <p data-bind="textContent: App.product.name"></p>
        <p data-bind="textContent: App.product.price"></p>

        <script src="jspm_packages/system.js"></script>
        <script src="config.js"></script>
        <script>
            System.import("lovedder/movi").then(function(movi) {
                movi.bindData();
            });

            /*
            App === {
                product: {
                    name: "",
                    price: ""
                }
            };
            */
        </script>
    </body>
</html>
```
En este caso primero son analizados los elementos "p" que "input".
