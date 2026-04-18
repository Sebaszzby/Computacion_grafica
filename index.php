<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portafolio | Computación Gráfica</title>
    <style>
        /* --- VARIABLES DE COLOR --- */
        :root {
            --primario: #2b5876;
            --secundario: #4e4376;
            --fondo: #f4f7f6;
            --texto: #333;
            --blanco: #ffffff;
        }

        /* --- ESTILOS GENERALES --- */
        body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--fondo);
            margin: 0;
            padding: 0;
            color: var(--texto);
            display: flex;
            flex-direction: column;
            min-height: 100vh; /* Asegura que el footer se quede abajo */
        }

        /* --- CABECERA (HEADER) --- */
        header {
            background: linear-gradient(135deg, var(--primario) 0%, var(--secundario) 100%);
            color: var(--blanco);
            padding: 4rem 2rem;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        header h1 {
            margin: 0;
            font-size: 2.8rem;
            letter-spacing: 1px;
        }

        .subtitulo {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-top: 15px;
            font-weight: 300;
        }

        /* --- CONTENEDOR PRINCIPAL (MAIN) --- */
        .contenedor {
            max-width: 1200px;
            margin: -3rem auto 3rem auto; /* Sube un poco sobre el header */
            padding: 0 20px;
            flex-grow: 1; /* Permite que el contenedor crezca */
            width: 100%;
            box-sizing: border-box;
        }

        /* Botón general para volver (Se usará en los ejercicios) */
        .btn-volver {
            display: inline-block;
            padding: 10px 20px;
            background-color: var(--primario);
            color: var(--blanco);
            text-decoration: none;
            border-radius: 6px;
            margin-bottom: 20px;
            font-weight: bold;
            transition: background 0.3s;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .btn-volver:hover {
            background-color: var(--secundario);
        }
    </style>
</head>
<body>

    <header>
        <h1>Computación Gráfica</h1>
        <p class="subtitulo">Portafolio Académico - Noveno Ciclo | Sebastian Altamirano Ochoa</p>
    </header>

    <main class="contenedor">