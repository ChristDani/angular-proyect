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


## 💸 Funcionalidades de Transferencias

El sistema cuenta con un completo módulo de transferencias y pagos con las siguientes características:

### 🔄 Tipos de Transferencias

#### 1. **Transferencias Entre Cuentas Propias**
- Transferencia de dinero entre las cuentas del mismo usuario
- Validación de saldos suficientes antes de la operación
- Conversión automática de monedas (USD ↔ PEN) con tasa fija de 3.75
- Registro automático de transacciones en ambas cuentas (débito y crédito)
- Modal de confirmación con detalles completos de la operación

#### 2. **Transferencias a Terceros**
- Transferencia de dinero a cuentas de otros usuarios
- Validación de existencia de cuenta destino
- Soporte para transferencias en diferentes monedas
- Conversión automática según la moneda de cada cuenta
- Descripción personalizable para cada transferencia
- Confirmación detallada con información de cuentas involucradas

#### 3. **Pagos de Servicios**
- Pago de servicios como Netflix, Spotify, ENEL, SEDAPAL, Movistar, etc.
- Debito automático desde la cuenta seleccionada
- Soporte multi-moneda con conversión automática
- Registro de transacciones con tipo "pago serv"
- Modal de confirmación específico para pagos de servicios

### 💱 Sistema de Monedas

#### **Monedas Soportadas**
- **PEN (Soles Peruanos)** - Moneda base
- **USD (Dólares Americanos)**
- **Tasa de Cambio Fija**: 1 USD = 3.75 PEN

#### **Conversión Automática**
- **Conversión Inteligente**: El sistema convierte automáticamente los montos según la moneda de cada cuenta
- **Validación de Saldos**: Valida el saldo en la moneda correcta antes de realizar operaciones
- **Información Transparente**: Muestra la tasa de cambio aplicada en las confirmaciones
- **Formato Apropiado**: Presenta los montos con símbolos correctos ($ para USD, S/ para PEN)

### 🎯 Experiencia de Usuario

#### **Modales Interactivos**
- **Diseño Consistente**: Todos los modales siguen la misma estructura base
- **Validaciones en Tiempo Real**: Verificación inmediata de datos ingresados
- **Información de Conversión**: Muestra automáticamente conversiones de moneda cuando aplica
- **Botones Intuitivos**: Acciones claras con colores diferenciados

#### **Sistema de Confirmación**
- **Modal Post-Operación**: Se abre automáticamente después de cada transacción exitosa
- **Información Completa**: 
  - ID único de operación
  - Fecha y hora exacta
  - Monto original y convertido (si aplica)
  - Detalles de cuentas involucradas
  - Tasa de cambio utilizada
- **Diseño Visual**: Iconos específicos para cada tipo de operación
- **Estados Claros**: Indicadores visuales de éxito o error

### 📊 Gestión de Transacciones

#### **Registro Automático**
- **Transacciones Duales**: Cada transferencia genera dos registros (débito y crédito)
- **IDs Únicos**: Identificadores únicos para rastrear operaciones relacionadas
- **Timestamps Precisos**: Registro exacto de fecha y hora con zona horaria
- **Descripciones Inteligentes**: Generación automática de descripciones descriptivas

#### **Agrupación Cronológica**
- **Hoy**: Transacciones del día actual
- **Ayer**: Transacciones del día anterior  
- **Este Mes**: Transacciones del mes en curso
- **Meses Anteriores**: Organizadas por mes y año
- **Ordenamiento**: Más recientes primero dentro de cada grupo

#### **Validaciones de Seguridad**
- **Cuentas Activas**: Solo permite operaciones en cuentas con estado "activa"
- **Saldos Suficientes**: Validación previa de fondos disponibles con conversión de moneda
- **Cuentas Válidas**: Verificación de existencia de cuentas destino
- **Montos Positivos**: Validación de montos mayores a cero
- **Sesión Activa**: Verificación de autenticación del usuario

### Credenciales de la Aplicación

Utiliza las siguientes credenciales para iniciar sesión durante las pruebas:

#### 👤 Usuarios Disponibles

- **Cliente**
  - Usuario: `cliente1`
  - Contraseña: `cliente123`

- **Administrador**
  - Usuario: `admin1`
  - Contraseña: `admin123`

