# BabylonJs_Rendu
Rendu du projet BabylonJs GDP3


Auteur
======
* Jérôme LE NAOU


Concept
=======
* Recréer un jeu dans lequel le joueur doit passer dans des anneaux. Chaque porte traversée rapporte des points.
* Une porte peut être protégée par un bouclier qu'il faut détruire en tirant dessus.
* La génération des anneaux est de plus en plus rapide et les anneaux sont de plus en plus espacés.
* La vue est la même qu'un Star Fox 64
* Toutes les données du jeu sont paramétrable dans le fichier config.js (changer les paramètres dans l'objet fps.options.current)
* Le joueur perd des points de vie lorsqu'il rate une porte ou lorsqu'il entre en collision avec un bouclier.
* Au fur et à mesure que le joueur monte son score, les boucliers changent de couleur et sont plus résistantes.
* Le joueur peut tirer des bullet simples ou des missiles avec un cooldown


Contrôles
=========
* Déplacer le vaisseau avec ZQSD
* Déplacer le viseur avec la souris
* Deux modes de tir :
    * Bullet simple : clic gauche
    * Missile : clic droit


Non implémenté
==============
* Des ennemis qui tirent sur le vaisseau du joueur tout en protégeant les boucliers sur les portes.
* Une gestion du score en local


Bugs connus
===========
* Il arrive que les missiles collisionnent avec les plaques du ground. Cela viendrait du fait que je l'ai créé avec un BABYLON.Mesh.CreateGroundFromHeightMap(...). Le box collider englobe bien toute la forme, mais il semble que le intersectsMesh(mesh, true), ne prenne pas la géométrie du mesh mais uniquement la bounding box.
