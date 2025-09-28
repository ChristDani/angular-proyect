### Grupo 1 
Integrantes:
  
- Itzel Andrea González Valecillos
- Maria Fernanda Perez Campos
- Marco Francisco Durand Lujan
- Christian Daniel Campaña Díaz
- Milton Cesar Mariños Perez

### RAMA A UTLIZAR
    Utilizar la rama main

### Diseño de maquetación con Figma
    Visualizar url: https://www.figma.com/design/rEYqa5X6LzQXQ4DfwoIjnH/Untitled?node-id=0-1&p=f&t=qEbUkMxZvdwonwFS-0

# Sistema de Gestión Bancaria Avanzada con Angular

## Descripción del Proyecto

Este es un proyecto para un curso de Angular que simula una aplicación web de gestión bancaria. El sistema permite dos tipos de roles: **clientes** y **administradores**, cada uno con su propio conjunto de funcionalidades para interactuar con productos financieros como cuentas, préstamos y tarjetas.

La aplicación está construida como una Single-Page Application (SPA) utilizando Angular y consume una **API REST simulada con `json-server`**, lo que permite un desarrollo completo del frontend sin necesidad de un backend real. La interfaz de usuario se desarrolla con la librería de componentes **Angular Material** para asegurar un diseño profesional y responsive.

### Características Principales

* **Autenticación por Roles**: Sistema de login que redirige a los usuarios a un dashboard de cliente o a un panel de administración según su rol.
* **Gestión para Clientes**: Los clientes pueden ver sus cuentas, el detalle de sus transacciones, realizar transferencias, pagar servicios y gestionar sus préstamos y tarjetas.
* **Panel de Administración**: Los administradores tienen acceso a un panel con **operaciones CRUD completas** (Crear, Leer, Actualizar, Eliminar) para gestionar todos los usuarios, cuentas, préstamos y tarjetas del sistema.
* **Rutas Protegidas**: Se implementan *guards* de Angular para proteger las rutas y asegurar que solo los usuarios autorizados puedan acceder a ciertas secciones.

## Ejecución del Proyecto

Para poder ejecutar este proyecto en tu máquina local, sigue los siguientes pasos.

### Prerrequisitos

Asegúrate de tener el siguiente software instalado:
* **Angular Version** 20.1.6
* **Node.js** (versión 16 o superior)
* **Angular CLI** (puedes instalarlo globalmente con `npm install -g @angular/cli`)

### Pasos para la Instalación

1.  **Clonar el Repositorio**
    Abre tu terminal y clona el proyecto desde su repositorio.
    ```bash
    git clone <URL-DEL-REPOSITORIO>
    cd <nombre-del-proyecto>
    ```

2.  **Instalar Dependencias**
    Una vez dentro de la carpeta del proyecto, ejecuta el siguiente comando para instalar todas las librerías y paquetes necesarios.
    ```bash
    npm install
    ```

### Iniciar la Aplicación

La aplicación requiere que dos procesos se ejecuten de forma simultánea en dos terminales separadas: la **API simulada** y el **servidor de desarrollo de Angular**.

1.  **Iniciar la API Simulada**
    En una terminal, ejecuta el siguiente comando para iniciar `json-server`. Este servidor leerá el archivo `db.json` y servirá los datos en `http://localhost:3000`.
    ```bash
    npm run serve:api
    ```

2.  **Iniciar el Servidor de Angular**
    En una **segunda terminal**, ejecuta el comando para iniciar el servidor de desarrollo de Angular.
    ```bash
    ng serve -o
    ```
    La opción `-o` abrirá automáticamente tu navegador en `http://localhost:4200/`, donde podrás ver la aplicación en funcionamiento.


### Credenciales de la Aplicación

Utiliza las siguientes credenciales para iniciar sesión durante las pruebas:

#### 👤 Usuarios Disponibles

- **Cliente**
  - Usuario: `cliente1`
  - Contraseña: `cliente123`

- **Administrador**
  - Usuario: `admin1`
  - Contraseña: `admin123`

