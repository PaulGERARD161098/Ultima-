// GÉNÉRÉ par `node zohshia/supervision-valeur/publier.mjs` depuis
// zohshia/supervision-valeur/CONTRAT.schema.json — ne pas modifier à la main.
export default {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "id",
    "objetId",
    "recommandation",
    "typeBenefice",
    "besoin",
    "beneficiaire",
    "constat",
    "consequence",
    "alternativeMinimale",
    "gainAttendu",
    "preuveAttendue",
    "sources",
    "reexamen"
  ],
  "properties": {
    "id": {
      "type": "string",
      "minLength": 1
    },
    "objetId": {
      "type": "string",
      "minLength": 1
    },
    "recommandation": {
      "type": "string",
      "enum": [
        "conserver",
        "mesurer",
        "ameliorer",
        "mutualiser",
        "simplifier",
        "suspendre",
        "proposer_retrait"
      ]
    },
    "typeBenefice": {
      "type": "string",
      "enum": [
        "direct",
        "indirect",
        "protection",
        "personnel"
      ]
    },
    "besoin": {
      "type": "string",
      "minLength": 1
    },
    "beneficiaire": {
      "type": "string",
      "minLength": 1
    },
    "constat": {
      "type": "string",
      "minLength": 1
    },
    "consequence": {
      "type": "string",
      "minLength": 1
    },
    "alternativeMinimale": {
      "type": "string",
      "minLength": 1
    },
    "gainAttendu": {
      "type": "string",
      "minLength": 1
    },
    "preuveAttendue": {
      "type": "string",
      "minLength": 1
    },
    "sources": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "id",
          "reference",
          "statut",
          "dateLecture",
          "dateObservation"
        ],
        "properties": {
          "id": {
            "type": "string",
            "minLength": 1
          },
          "reference": {
            "type": "string",
            "minLength": 1
          },
          "statut": {
            "type": "string",
            "enum": [
              "mesure",
              "declare",
              "infere",
              "non_verifie"
            ]
          },
          "dateLecture": {
            "type": "string",
            "format": "date-time"
          },
          "dateObservation": {
            "type": "string",
            "format": "date-time"
          }
        }
      }
    },
    "contrefactuel": {
      "type": "string"
    },
    "preuveDependancesId": {
      "type": "string"
    },
    "preuveProtectionsId": {
      "type": "string"
    },
    "retourArriere": {
      "type": "string"
    },
    "capaciteCommune": {
      "type": "string"
    },
    "compatibiliteVerifiee": {
      "type": "string"
    },
    "transfertDonnees": {
      "type": "boolean",
      "const": false
    },
    "reexamen": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "responsable",
        "declencheur",
        "criterePoursuite",
        "critereArret"
      ],
      "properties": {
        "responsable": {
          "type": "string",
          "minLength": 1
        },
        "declencheur": {
          "type": "string",
          "minLength": 1
        },
        "criterePoursuite": {
          "type": "string",
          "minLength": 1
        },
        "critereArret": {
          "type": "string",
          "minLength": 1
        }
      }
    }
  }
};
