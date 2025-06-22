// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract VerificadorNoticias {
    struct Noticia {
        address autor;
        string titulo;
        string descripcion;
        string categoria;
        string hashContenido;
        uint sumaVotos;
        uint cantidadVotos;
        mapping(address => bool) votantes;
    }

    struct Preview {
        uint id;
        address autor;
        string titulo;
        string descripcion;
        string categoria;
        uint promedio;
        uint cantidadVotos;
        string hashContenido;
    }

    uint public totalNoticias;
    mapping(uint => Noticia) private noticias;

    uint[] public noticiasGenerales;
    mapping(address => uint[]) public noticiasPorAutor;

    mapping(address => uint[]) public votosRealizados;
    mapping(address => mapping(uint => uint)) public votosDetalle;

    event NoticiaPublicada(uint indexed id, address indexed autor, string titulo);
    event VotoEmitido(uint indexed id, address indexed validador, uint puntuacion);

    function publicarNoticia(
        string calldata titulo,
        string calldata descripcion,
        string calldata categoria,
        string calldata hashContenido
    ) external returns (uint) {
        uint id = totalNoticias++;

        Noticia storage n = noticias[id];
        n.autor = msg.sender;
        n.titulo = titulo;
        n.descripcion = descripcion;
        n.categoria = categoria;
        n.hashContenido = hashContenido;

        noticiasGenerales.push(id);
        noticiasPorAutor[msg.sender].push(id);

        emit NoticiaPublicada(id, msg.sender, titulo);
        return id;
    }

    function validarNoticia(uint id, uint puntuacion) external {
        require(id < totalNoticias, "Noticia inexistente");
        require(puntuacion >= 1 && puntuacion <= 10, "Puntuacion fuera de rango");

        Noticia storage n = noticias[id];
        require(!n.votantes[msg.sender], "Ya votaste");

        n.votantes[msg.sender] = true;
        n.sumaVotos += puntuacion;
        n.cantidadVotos += 1;

        votosRealizados[msg.sender].push(id);
        votosDetalle[msg.sender][id] = puntuacion;

        emit VotoEmitido(id, msg.sender, puntuacion);
    }

    function obtenerPreviewNoticia(uint id) public view returns (Preview memory p) {
        require(id < totalNoticias, "Noticia inexistente");
        Noticia storage n = noticias[id];
        uint promedio = n.cantidadVotos == 0 ? 0 : n.sumaVotos / n.cantidadVotos;

        p = Preview({
            id: id,
            autor: n.autor,
            titulo: n.titulo,
            descripcion: n.descripcion,
            categoria: n.categoria,
            promedio: promedio,
            cantidadVotos: n.cantidadVotos,
            hashContenido: n.hashContenido
        });
    }

    function obtenerPreviewsNoticiasGenerales() external view returns (Preview[] memory previews) {
        uint cantidad = noticiasGenerales.length;
        previews = new Preview[](cantidad);
        for (uint i = 0; i < cantidad; i++) {
            previews[i] = obtenerPreviewNoticia(noticiasGenerales[i]);
        }
    }

    function obtenerPreviewsMisNoticias() external view returns (Preview[] memory previews) {
        uint[] storage ids = noticiasPorAutor[msg.sender];
        uint cantidad = ids.length;
        previews = new Preview[](cantidad);
        for (uint i = 0; i < cantidad; i++) {
            previews[i] = obtenerPreviewNoticia(ids[i]);
        }
    }

    function obtenerPreviewsMisVotaciones() external view returns (Preview[] memory previews, uint[] memory puntuaciones) {
        uint[] storage ids = votosRealizados[msg.sender];
        uint cantidad = ids.length;
        previews = new Preview[](cantidad);
        puntuaciones = new uint[](cantidad);
        for (uint i = 0; i < cantidad; i++) {
            uint id = ids[i];
            previews[i] = obtenerPreviewNoticia(id);
            puntuaciones[i] = votosDetalle[msg.sender][id];
        }
    }
}