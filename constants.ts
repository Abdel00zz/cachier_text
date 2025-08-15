
export const TYPE_MAP: { [key: string]: string } = {
    'definition': 'définition', 'définition': 'définition',
    'theorem': 'théorème', 'théorème': 'théorème', 'theoreme': 'théorème',
    'proposition': 'proposition', 'prop': 'proposition',
    'lemma': 'lemme', 'lemme': 'lemme',
    'corollary': 'corollaire', 'corollaire': 'corollaire', 'corol': 'corollaire',
    'remark': 'remarque', 'remarque': 'remarque', 'rem': 'remarque',
    'proof': 'preuve', 'preuve': 'preuve',
    'example': 'exemple', 'exemple': 'exemple', 'ex': 'exemple',
    'exercise': 'exercice', 'exercice': 'exercice', 'exo': 'exercice',
    'activity': 'activité', 'activité': 'activité', 'activite': 'activité', 'act': 'activité',
    'application': 'application', 'app': 'application'
};

export const BADGE_TEXT_MAP: { [key: string]: string } = {
    'définition': 'Déf.', 'théorème': 'Théo.', 'proposition': 'Prop.',
    'lemme': 'Lemme', 'corollaire': 'Cor.', 'remarque': 'Rem.',
    'preuve': 'Preuve', 'exemple': 'Ex.', 'exercice': 'Exo.',
    'activité': 'Act.', 'application': 'App.'
};

export const BADGE_COLOR_MAP: { [key: string]: string } = {
    'définition': 'bg-badge-definition', 'théorème': 'bg-badge-theoreme', 'proposition': 'bg-badge-proposition',
    'lemme': 'bg-badge-lemme', 'corollaire': 'bg-badge-corollaire', 'remarque': 'bg-badge-remarque',
    'preuve': 'bg-badge-preuve', 'exemple': 'bg-badge-exemple', 'exercice': 'bg-badge-exercice',
    'activité': 'bg-badge-activite', 'application': 'bg-badge-application'
};

export const GUIDE_MARKDOWN = `
# Guide d'Utilisation - Cahier de Textes

Bienvenue dans le guide du Cahier de Textes Numérique ! Cette version apporte de nouvelles fonctionnalités pour vous rendre encore plus productif.

## Fonctionnalités Clés

### <i class="fas fa-plus-circle"></i> Ajouter un Élément
- **Comment faire** : Survolez une ligne de titre (Chapitre ou Section) et cliquez sur le bouton <i class="fas fa-plus-circle"></i> qui apparaît à droite.
- **Formulaire d'ajout** : Une fenêtre s'ouvre vous permettant de définir le type d'élément (Définition, Théorème, Exercice...), son titre, sa description, et plus encore.
- **Positionnement** : L'élément sera automatiquement ajouté à la fin de la section ou du chapitre que vous avez choisi.

### <i class="fas fa-search"></i> Rechercher et Filtrer
- **Accès** : Cliquez sur le menu "Plus d'actions" (<i class="fas fa-ellipsis-v"></i>). La barre de recherche se trouve en haut du menu.
- **Utilisation** : Tapez simplement un mot, une date (ex: "2024-05-17") ou un numéro d'exercice. Le tableau se filtrera en temps réel pour n'afficher que les lignes correspondantes.
- **Réinitialiser** : Effacez le contenu de la barre de recherche pour afficher à nouveau tout le cahier.

### <i class="fas fa-edit"></i> Édition du Contenu
- **Sélecteur de Date** : Cliquez sur une cellule 'Date'. Un calendrier apparaîtra pour choisir une date.
- **Cellule 'Remarque'** : Cliquez et tapez directement.
- **Suppression d'un élément** : Survolez n'importe quelle ligne. Un bouton rouge <i class="fas fa-trash-alt"></i> apparaît. Un clic dessus, après confirmation, supprimera la ligne et tout son contenu (ex: supprimer une section supprime tous ses items).

### <i class="fas fa-save"></i> Sauvegarde et Données
- **Système d'instance** : Chaque fichier HTML a sa propre sauvegarde. Renommez le fichier pour créer un nouveau cahier de textes (ex: \`cahier_maths_3eme.html\`). L'identifiant de l'instance est affiché en haut.
- **Exporter/Importer JSON** : Utilisez le menu "Plus d'actions" pour sauvegarder votre travail dans un fichier \`.json\` (recommandé !) ou pour charger des données.

### <i class="fas fa-undo"></i>/<i class="fas fa-redo"></i> Annuler / Rétablir
- Annulez (<i class="fas fa-undo"></i> ou <kbd>Ctrl</kbd>+<kbd>Z</kbd>) ou rétablissez (<i class="fas fa-redo"></i> ou <kbd>Ctrl</kbd>+<kbd>Y</kbd>) la plupart des actions, y compris l'ajout et la suppression de nouveaux éléments.

## Conseils Pratiques
- **Utilisez les boutons d'action** : L'ajout et la suppression via les boutons <i class="fas fa-plus-circle"></i> et <i class="fas fa-trash-alt"></i> sur les lignes est la méthode la plus rapide pour gérer votre contenu au quotidien.
- **Sauvegardes externes** : Pensez à "Exporter JSON" <i class="fas fa-file-export"></i> régulièrement. C'est la meilleure assurance pour votre travail.
`;
