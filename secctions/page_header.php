<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portafolio | Computación Gráfica</title>
    <style>
        :root {
            --primario: #2b5876;
            --secundario: #4e4376;
            --fondo: #f4f7f6;
            --texto: #333;
        }
        body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--fondo);
            margin: 0;
            padding: 0;
            color: var(--texto);
            display: flex;
            flex-direction: column;
            min-height: 100vh; /* Para que el footer se quede abajo */
        }
        header {
            background: linear-gradient(135deg, var(--primario) 0%, var(--secundario) 100%);
            color: white;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        header h1 { margin: 0; font-size: 2.2rem; }
        header p { margin: 10px 0 0 0; font-weight: 300; opacity: 0.9; }
        
        /* Contenedor centralizado para el contenido de las páginas */
        main {
            flex-grow: 1;
            width: 100%;
            max-width: 900px;
            margin: 2rem auto;
            padding: 2rem;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            box-sizing: border-box;
        }

        /* Botón para regresar al menú */
        .btn-volver {
            display: inline-block;
            padding: 10px 20px;
            background-color: var(--primario);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-bottom: 20px;
            font-weight: bold;
            transition: background 0.3s;
        }
        .btn-volver:hover {
            background-color: var(--secundario);
        }
    </style>
</head>
<body>
    <header>
        <h1>Computación Gráfica</h1>
        <p>Portafolio de Ejercicios | Sebastian Altamirano Ochoa</p>
    </header>
    <main>