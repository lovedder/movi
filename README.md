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

model.name = "Cebolla";
view.price = 7;

model === view; // true

/*
    product === {
        name: "Cebolla",
        price: 7
    };
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

Implícita en el modelo:
```html
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
```

Implícita en el vista:
```html
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
```

El modelo siempre superpondrá la vista y si algo esta declarado solo en la vista se tomará el valor del primer elemento analizado. Por ejemplo: En el siguiente caso primero son analizados los elementos "p" que "input":
```html
<form>
    <input data-bind="value: App.product.name" value="Aguacate">
    <input data-bind="value: App.product.price" value="43">
    <button>Create</button>
</form>

<p data-bind="textContent: App.product.name">Coco</p>
<p data-bind="textContent: App.product.price">14.5</p>

<script src="jspm_packages/system.js"></script>
<script src="config.js"></script>
<script>
    System.import("lovedder/movi").then(function(movi) {
        movi.bindData();
    });

    /*
        App === {
            product: {
                name: "Coco",
                price: "14.5"
            }
        };
    */
</script>
```
También puedes usar la variable especial "this" que hace referencia al elemento. Mira como enlazar colecciones para más detalle.

# Enlazar funciones con eventos
```html
<form data-bind-event="submit: App.createProduct(App.product)">
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

    App.createProduct = function(product) {
        console.log("Product created, name: " + product.name + ", price: " + product.price);
    };

    System.import("lovedder/movi").then(function(movi) {
        movi.bindData();
    });
</script>
```

# Enlazar colecciones
Al enlazar una colección a un elemento se repetirá el contenido del mismo. Todos los elementos hijos tienen una referencia a su padre en el atributo "data-[padre]-index"
Puedes anidar colecciones y no estas obligado a enlazar solo información dentro del ámbito de la colección.

En los siguientes ejemplos se repetirá el elemento "tr" tres veces, se puede acceder al índice de la repetición obteniendo el valor del atributo "data-product-index" y se enlaza la función "App.deleteProduct" que esta fuera del ámbito de la colección:
```html
<form data-bind-event="submit: App.createProduct(App.product)">
    <label>New product
        <input data-bind="value: App.product">
    </label>
    <button>Create</button>
</form>

<table>
    <thead>
        <tr>
            <td>Index</td>
            <td>Name</td>
            <td></td>
        </tr>
    </thead>
    <tbody data-repeat="product of App.products">
        <tr>
            <td data-bind="textContent: this.dataset.productIndex"></td>
            <td data-bind="textContent: product"></td>
            <td data-bind-event="click: App.deleteProduct(this.dataset.productIndex)">X</td>
        </tr>
    </tbody>
</table>

<script src="jspm_packages/system.js"></script>
<script src="config.js"></script>
<script>

    var App = {
        product: "",
        products: [
            "Chile",
            "Tomate",
            "Cebolla"
        ]
    };

    App.createProduct = function(name, form) {
        App.products.unshift(name);

        App.product = "";
    };

    App.deleteProduct = function(index) {
        App.products.splice(index, 1);
    };

    System.import("lovedder/movi").then(function(movi) {
        movi.bindData();
    });
</script>
```

```html
<form data-bind-event="submit: App.createProduct(App.product)">
    <fieldset>
        <legend>New product</legend>
        <input data-bind="value: App.product.name">
        <input data-bind="value: App.product.price">
        <button>Create</button>
    </fieldset>
</form>

<table>
    <thead>
        <tr>
            <td>Index</td>
            <td>Name</td>
            <td>Price</td>
            <td></td>
        </tr>
    </thead>
    <tbody data-repeat="product of App.products">
        <tr>
            <td data-bind="textContent: this.dataset.productIndex"></td>
            <td data-bind="textContent: product.name"></td>
            <td data-bind="textContent: product.price"></td>
            <td data-bind-event="click: App.deleteProduct(this.dataset.productIndex)">X</td>
        </tr>
    </tbody>
</table>

<script src="jspm_packages/system.js"></script>
<script src="config.js"></script>
<script>

    var App = {
        product: {
            name: "",
            price: ""
        },
        products: [
            {
                name:"Chile",
                price: 8
            },
            {
                name: "Tomate",
                price: 11
            },
            {
                name: "Cebolla",
                price: 9
            }
        ]
    };

    App.createProduct = function(product) {
        App.products.unshift({
            name: product.name,
            price: product.price
        });

        App.product.name = "";
        App.product.price = "";
    };

    App.deleteProduct = function(index) {
        App.products.splice(index, 1);
    };

    System.import("lovedder/movi").then(function(movi) {
        movi.bindData();
    });
</script>
```

# Enlazar condiciones
Al enlazar una condición a un elemento puedes controlar la presencia o ausencia de su contenido:
```html
<form data-bind-event="submit: App.createProduct(App.product)">
    <fieldset>
        <legend>New product</legend>
        <input data-bind="value: App.product.name">
        <input data-bind="value: App.product.price">
        <button>Create</button>
    </fieldset>
</form>

<table>
    <thead>
        <tr>
            <td>Index</td>
            <td>Name</td>
            <td>Price</td>
            <td></td>
            <td></td>
        </tr>
    </thead>
    <tbody data-repeat="product of App.products">
        <tr>
            <td data-bind="textContent: this.dataset.productIndex"></td>
            <td>
                <div data-if="!product.editing">
                    <p data-bind="textContent: product.name"></p>
                </div>
                <div data-if="product.editing">
                    <input data-bind="value: product.name">
                </div>
            </td>
            <td>
                <div data-if="!product.editing">
                    <p data-bind="textContent: product.price"></p>
                </div>
                <div data-if="product.editing">
                    <input data-bind="value: product.price">
                </div>
            </td>
            <td data-if="!product.editing">
                <p data-bind-event="click: App.editProduct(product)">Edit</p>
            </td>
            <td data-if="product.editing">
                <p data-bind-event="click: App.editProduct(product)">Save</p>
            </td>
            <td data-bind-event="click: App.deleteProduct(this.dataset.productIndex)">X</td>
        </tr>
    </tbody>
</table>

<script src="jspm_packages/system.js"></script>
<script src="config.js"></script>
<script>

    var App = {
        product: {
            name: "",
            price: ""
        },
        products: [
            {
                name:"Chile",
                price: 8
            },
            {
                name: "Tomate",
                price: 11
            },
            {
                name: "Cebolla",
                price: 9
            }
        ]
    };

    App.createProduct = function(product) {
        App.products.unshift({
            name: product.name,
            price: product.price
        });

        App.product.name = "";
        App.product.price = "";
    };

    App.deleteProduct = function(index) {
        App.products.splice(index, 1);
    };

    App.editProduct = function(product) {
        product.editing = product.editing ?
            false :
            true;
    };

    System.import("lovedder/movi").then(function(movi) {
        movi.bindData();
    });
</script>
```
