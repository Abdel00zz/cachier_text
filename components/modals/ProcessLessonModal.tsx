import React, { useState, useCallback } from 'react';
import Modal from './Modal';
import { Chapter, NotificationType } from '../../types';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import LoadingSpinner from '../LoadingSpinner';

interface ProcessLessonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProcessComplete: (chapters: Chapter[]) => void;
    showNotification: (message: string, type: NotificationType) => void;
}

const itemSchema = {
  type: Type.OBJECT,
  properties: {
    type: { 
      type: Type.STRING, 
      description: "Type normalisé : 'définition', 'théorème', 'proposition', 'lemme', 'corollaire', 'remarque', 'preuve', 'activité', 'exemple', 'application', ou 'exercice'",
      enum: ['définition', 'théorème', 'proposition', 'lemme', 'corollaire', 'remarque', 'preuve', 'activité', 'exemple', 'application', 'exercice']
    },
    title: { 
      type: Type.STRING, 
      description: "Titre concis (max 8 mots pour définitions/théorèmes, max 25 pour exemples). Vide pour les preuves.", 
      nullable: true 
    },
    number: { 
      type: Type.STRING, 
      description: "Numéro de l'élément si présent (ex: '1.1', 'a)')", 
      nullable: true 
    },
    description: { 
      type: Type.STRING, 
      description: "Un très bref résumé des points clés (12 mots MAXIMUM). Pas de HTML. Contenu vide ('') si pas de résumé pertinent.", 
      nullable: true 
    },
    page: { 
      type: Type.STRING, 
      description: "Référence de page (ex: 'p. 42')", 
      nullable: true 
    },
    date: { 
      type: Type.STRING, 
      description: "Date au format AAAA-MM-JJ", 
      nullable: true 
    },
    remark: { 
      type: Type.STRING, 
      description: "Remarque pour le cahier de textes", 
      nullable: true 
    },
  },
  required: ['type']
};

const subsectionSchema = {
    type: Type.OBJECT,
    properties: {
        name: { 
          type: Type.STRING, 
          description: "Nom sans préfixe numérique. Chaîne vide si pas de titre visible." 
        },
        items: { 
          type: Type.ARRAY, 
          items: itemSchema, 
          description: "Liste des éléments de la sous-section",
          nullable: true 
        },
        date: { type: Type.STRING, nullable: true },
        remark: { type: Type.STRING, nullable: true },
    },
    required: ['name']
};

const sectionSchema = {
  type: Type.OBJECT,
  properties: {
    name: { 
      type: Type.STRING, 
      description: "Nom de la section SANS préfixe (pas de I-, II-, etc.)" 
    },
    subsections: { 
      type: Type.ARRAY, 
      items: subsectionSchema, 
      description: "Utilisé SEULEMENT si la section a des sous-divisions numérotées",
      nullable: true 
    },
    items: { 
      type: Type.ARRAY, 
      items: itemSchema,
      description: "Utilisé si la section n'a PAS de sous-divisions (section simple)",
      nullable: true 
    },
    date: { type: Type.STRING, nullable: true },
    remark: { type: Type.STRING, nullable: true },
  },
  required: ['name']
};

const chapterSchema = {
  type: Type.OBJECT,
  properties: {
    chapter: { 
      type: Type.STRING, 
      description: "Titre principal du chapitre" 
    },
    sections: { 
      type: Type.ARRAY, 
      items: sectionSchema,
      description: "Sections principales du chapitre"
    },
    date: { type: Type.STRING, nullable: true },
    remark: { type: Type.STRING, nullable: true },
  },
  required: ['chapter', 'sections']
};

const lessonsDataSchema = {
    type: Type.OBJECT,
    properties: {
        lessonsData: {
            type: Type.ARRAY,
            items: chapterSchema,
            description: "Tableau structuré de tous les chapitres du document"
        }
    },
    required: ['lessonsData']
};

const ProcessLessonModal: React.FC<ProcessLessonModalProps> = ({ isOpen, onClose, onProcessComplete, showNotification }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [processedData, setProcessedData] = useState<Chapter[] | null>(null);

    const resetModalState = useCallback(() => {
        setFile(null);
        setIsDragging(false);
        setIsLoading(false);
        setLoadingMessage('');
        setError(null);
        setProcessedData(null);
    }, []);

    const handleClose = useCallback(() => {
        resetModalState();
        onClose();
    }, [resetModalState, onClose]);

    const handleFileChange = (files: FileList | null) => {
        if (files && files[0] && files[0].type === 'application/pdf') {
            setFile(files[0]);
            setError(null);
        } else {
            setError('Veuillez sélectionner un fichier PDF.');
            setFile(null);
        }
    };

    const fileToGenerativePart = async (file: File) => {
        const base64EncodedDataPromise = new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
        });
        return {
            inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
        };
    };

    const handleProcess = async () => {
        if (!file) return;

        if (!process.env.API_KEY) {
            setError("La clé API n'est pas configurée. Le traitement ne peut pas continuer.");
            showNotification("Configuration de l'API manquante.", "error");
            return;
        }

        setIsLoading(true);
        setError(null);
        setProcessedData(null);

        try {
            setLoadingMessage("Initialisation de l'IA...");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            setLoadingMessage("Préparation du document...");
            const filePart = await fileToGenerativePart(file);

            const prompt = `# Manuel de Conversion JSON pour IA (v4.2) - Cahier de Textes

## **OBJECTIF**

Convertir un document de cours de mathématiques en un fichier JSON pour un "cahier de textes". La sortie doit être concise, se concentrant sur les titres et de très brefs résumés. La précision de la structure et de la syntaxe est primordiale.

## **DIRECTIVES FONDAMENTALES (Règles non négociables)**

1.  **CHAMP 'description' :** Le champ \`description\` **DOIT** être un résumé très concis des points essentiels, avec une limite stricte de **12 mots MAXIMUM**. Ne jamais inclure le contenu complet. Si aucun résumé pertinent n'est possible, utiliser \`""\` (chaîne vide).
2.  **PAS DE HTML :** Ne jamais générer de balises HTML dans les champs.
3.  **HIÉRARCHIE MAXIMALE :** La structure maximale autorisée est \`Chapitre → Section → Subsection → Items\`.
4.  **HIÉRARCHIE MINIMALE :** La structure minimale autorisée est \`Chapitre → Section → Items\`.
5.  **NIVEAU OBSOLÈTE :** Le champ \`subsubsections\` est interdit et ne doit jamais être généré.
6.  **SYNTAXE LATEX :** Dans toute chaîne JSON (\`title\`, \`description\`), chaque caractère antislash \`\\\` d'une commande LaTeX **DOIT** être échappé. Règle : \`\\\` devient \`\\\\\`.
7.  **AFFICHAGE MATHÉMATIQUE :** Utiliser \`$$...$$\` pour les formules importantes (limites, sommes). Utiliser \`$...$\` pour les formules en ligne.
8.  **PRÉFIXES DE TITRE :** Tous les préfixes de numérotation (\`I-\`, \`II-\`, \`1)\`, \`a)\`, etc.) **DOIVENT** être retirés des champs \`"name"\`.

## **ALGORITHME DE TRAITEMENT**

### Phase 1 : Analyse Structurelle
-   **Scan Initial :** Identifier le \`chapter\` (un seul par document), les \`sections\` (\`I- ...\`), les \`subsections\` (\`1) ...\`), et les \`items\` ("Définition", "Théorème", etc.).
-   **Logique de Consolidation :** Pour chaque \`section\`, si elle contient des \`subsections\`, marquer comme "complexe". Sinon, marquer comme "simple".

### Phase 2 : Génération du JSON
-   Traduire la structure analysée en JSON.
-   Si une section est "complexe", utiliser la structure \`"subsections": [{"name": "...", "items": [...]}]\`.
-   Si une section est "simple", utiliser la structure \`"items": [...] \` directement sous la section.

### Phase 3 : Formatage du Contenu des Items
1.  **Mappage des Types :** Mapper les mots-clés du document aux types normalisés (\`"définition"\`, \`"théorème"\`, etc.). Pour "Preuve", le \`title\` doit être \`""\`.
2.  **Traitement des Titres et Descriptions :**
    *   Extraire les titres.
    *   **Générer un résumé de 12 mots maximum pour la description.**
    *   Appliquer l'échappement LaTeX \`\\\` -> \`\\\\\`.
    *   **Cas Spécifique \`exercice\`:** Le \`title\` doit être **uniquement** la référence (ex: "Page 15").

## **EXEMPLE DE SQUELETTE JSON ATTENDU (NOTEZ LES DESCRIPTIONS BRÈVES)**

\`\`\`json
[
  {
    "chapter": "Les Nombres Complexes",
    "sections": [
      {
        "name": "Rappel",
        "subsections": [
          {
            "name": "Définitions",
            "items": [
              {
                "type": "définition",
                "number": "1",
                "title": "Ensemble des nombres réels $\\\\mathbb{R}$",
                "description": "L'ensemble $\\\\mathbb{R}$ inclut tous les nombres rationnels et irrationnels."
              },
              {
                "type": "proposition",
                "number": "1",
                "title": "Propriété sur les fractions",
                "description": "Définit la fraction $$\\frac{a}{b}$$ pour tous réels avec $b \\\\neq 0$."
              }
            ]
          }
        ]
      },
      {
        "name": "Limite de la suite géométrique",
        "items": [
          {
            "type": "théorème",
            "number": "1",
            "title": "Convergence de la suite $e$",
            "description": "La limite fondamentale de la suite $(1 + 1/n)^n$ est $e$."
          }
        ]
      },
      {
        "name": "Exercices du Chapitre",
        "subsections": [
          {
            "name": "",
            "items": [
              {
                "type": "exercice",
                "number": "1",
                "title": "Page 42",
                "description": ""
              }
            ]
          }
        ]
      }
    ]
  }
]
\`\`\``;

            setLoadingMessage("Analyse du document en cours... (cela peut prendre 30-60 secondes)");
            const response : GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ text: prompt }, filePart] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: lessonsDataSchema,
                    temperature: 0.1, // Réduire la créativité pour plus de précision
                    topP: 0.95,
                },
            });

            setLoadingMessage("Finalisation et validation...");
            
            const responseText = response.text;
            const parsedJson = JSON.parse(responseText);

            if (!parsedJson.lessonsData || !Array.isArray(parsedJson.lessonsData)) {
                throw new Error("Format de réponse invalide : la clé 'lessonsData' est manquante ou n'est pas un tableau.");
            }

            parsedJson.lessonsData.forEach((chapter: any, index: number) => {
                if (!chapter.chapter || !chapter.sections) {
                    throw new Error(`Chapitre ${index + 1} invalide : structure incomplète.`);
                }
            });

            setProcessedData(parsedJson.lessonsData);
        } catch (e: any) {
            console.error('Erreur lors du traitement:', e);
            setError(`Erreur: ${e.message || 'Une erreur inconnue est survenue'}. Assurez-vous que la configuration de l'API est correcte et consultez la console pour plus de détails.`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleApply = () => {
        if (processedData) {
            onProcessComplete(processedData);
            handleClose();
        }
    };
    
    const handleSaveJson = () => {
        if (!processedData) return;
        try {
            const dataToExport = {
                metadata: {
                    version: "4.2-AI-Generated",
                    exportDate: new Date().toISOString(),
                    appName: "Cahier de Textes",
                },
                lessonsData: processedData,
            };
            const jsonString = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            a.href = url;
            a.download = `lecon_ia_${dateStr}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            setError("Erreur lors de la création du fichier JSON.");
            console.error(e);
        }
    };

    const footer = processedData ? (
        <>
            <button onClick={handleClose} className="px-4 py-2 rounded-button text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300">Fermer</button>
            <button onClick={handleSaveJson} className="px-4 py-2 rounded-button text-sm font-medium bg-secondary text-white hover:bg-secondary/90 flex items-center gap-2">
                <i className="fas fa-save"></i>
                Sauvegarder le JSON
            </button>
            <button onClick={handleApply} className="px-4 py-2 rounded-button text-sm font-medium bg-success text-white hover:bg-success/90 flex items-center gap-2">
                 <i className="fas fa-check"></i>
                Appliquer au cahier
            </button>
        </>
    ) : (
        <>
            <button 
                onClick={handleClose} 
                className="px-4 py-2 rounded-button text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
                Annuler
            </button>
            <button 
                onClick={handleProcess} 
                disabled={!file || isLoading}
                className="px-4 py-2 rounded-button text-sm font-medium bg-success text-white hover:bg-success/90 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isLoading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Traitement...</span>
                    </> 
                ) : (
                    'Lancer le traitement'
                )}
            </button>
        </>
    );

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} 
            title="Traiter une leçon avec l'IA" 
            footer={footer} 
            maxWidth="max-w-2xl"
        >
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <LoadingSpinner text={loadingMessage}/>
                </div>
            ) : processedData ? (
                 <div className="flex flex-col items-center justify-center h-64 text-center">
                    <i className="fas fa-check-circle text-5xl text-success mb-4"></i>
                    <h3 className="text-xl font-semibold text-gray-800">Traitement terminé avec succès !</h3>
                    <p className="mt-2 text-gray-600">
                        La leçon a été analysée. Vous pouvez maintenant l'appliquer au cahier de textes ou sauvegarder le fichier JSON généré pour une utilisation ultérieure.
                    </p>
                </div>
            ) : (
                <>
                    <p className="mb-4 text-center text-gray-600">
                       Uploadez votre leçon en PDF pour la traiter avec l'IA. Le traitement peut prendre jusqu'à une minute.
                    </p>
                    <div 
                        onDragOver={(e) => { 
                            e.preventDefault(); 
                            setIsDragging(true); 
                        }}
                        onDragLeave={(e) => { 
                            e.preventDefault(); 
                            setIsDragging(false); 
                        }}
                        onDrop={(e) => { 
                            e.preventDefault(); 
                            setIsDragging(false); 
                            handleFileChange(e.dataTransfer.files); 
                        }}
                        className={`
                            relative flex flex-col items-center justify-center w-full h-48 
                            border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
                            ${isDragging 
                                ? 'border-primary bg-primary/10 scale-[1.02]' 
                                : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                            }
                        `}
                    >
                        <input 
                            type="file" 
                            id="pdf-upload" 
                            className="hidden" 
                            accept=".pdf" 
                            onChange={(e) => handleFileChange(e.target.files)} 
                        />
                        <label 
                            htmlFor="pdf-upload" 
                            className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                        >
                            <i className="fas fa-file-pdf text-4xl text-red-500 mb-3"></i>
                            {file ? (
                                <div className="text-center">
                                    <p className="font-semibold text-gray-800">{file.name}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <p className="font-semibold text-gray-700">
                                        Déposez votre fichier PDF ici
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        ou cliquez pour sélectionner
                                    </p>
                                </>
                            )}
                        </label>
                    </div>
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-center text-red-700 font-medium">
                                {error}
                            </p>
                        </div>
                    )}
                </>
            )}
        </Modal>
    );
};

export default ProcessLessonModal;
