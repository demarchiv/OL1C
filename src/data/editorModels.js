// Starting models for the Ocean Literacy Dimensions Editor.
// IDs: B = Brennan et al. 2019, M = McKinley et al. 2023, F = Fauville et al. 2024.
// Descriptions are the authors' own wording, as quoted in Fauville et al. 2024 (Tables 1 and 2).
// 'label' is what is drawn on the wave (it follows the wording already used in the app).
// M9 has no description because the sentence is cut off in the source table: add it from the original paper.

export const EDITOR_MODELS = {
  "B": {
    "key": "B",
    "name": "6-DIMENSIONS MODEL",
    "cite": "Brennan et al., 2019",
    "dimensions": [
      {
        "id": "B1",
        "label": "KNOWLEDGE",
        "name": "Knowledge",
        "description": "What a person knows about an ocean related topic and the links between topics."
      },
      {
        "id": "B2",
        "label": "COMMUNICATION",
        "name": "Communication",
        "description": "A person communicates with others, such as family and peer groups, on ocean related topics."
      },
      {
        "id": "B3",
        "label": "BEHAVIOR",
        "name": "Behavior",
        "description": "Decisions, choices, actions, and habits with respect to ocean related issues."
      },
      {
        "id": "B4",
        "label": "ATTITUDE",
        "name": "Attitude",
        "description": "Level of agreement with or concern for a particular position."
      },
      {
        "id": "B5",
        "label": "AWARENESS",
        "name": "Awareness",
        "description": "Basic knowledge that a situation, problem or concept exists."
      },
      {
        "id": "B6",
        "label": "ACTIVISM",
        "name": "Activism",
        "description": "Degree to which a person engages in activities such as campaigning (for example through social media) to bring about changes in policy, attitudes, behaviour, etc."
      }
    ]
  },
  "M": {
    "key": "M",
    "name": "10-DIMENSIONS MODEL",
    "cite": "McKinley et al., 2023",
    "dimensions": [
      {
        "id": "M1",
        "label": "KNOWLEDGE",
        "name": "Knowledge",
        "description": "What a person knows about an ocean related topic and the links between topics."
      },
      {
        "id": "M2",
        "label": "COMMUNICATION",
        "name": "Communication",
        "description": "A person communicates with others, such as family and peer groups, on ocean related topics."
      },
      {
        "id": "M3",
        "label": "BEHAVIOR",
        "name": "Behavior",
        "description": "Decisions, choices, actions, and habits with respect to ocean related issues at a range of scales, including from individual, sector and policy actors and institutions with a view to bringing about whole system change."
      },
      {
        "id": "M4",
        "label": "ATTITUDE",
        "name": "Attitude",
        "description": "Level of agreement with or concern for a particular position."
      },
      {
        "id": "M5",
        "label": "AWARENESS",
        "name": "Awareness",
        "description": "Basic knowledge and understanding that a situation, problem or concept exists."
      },
      {
        "id": "M6",
        "label": "ACTIVISM",
        "name": "Activism",
        "description": "Degree to which a person engages in a wide range of activities, which can constitute activism, such as campaigning (for example through social media, attending public rallies or writing to elected officials) to bring about changes in policy, attitudes, behaviour, etc."
      },
      {
        "id": "M7",
        "label": "EMOCEANS",
        "name": "Emoceans",
        "description": "How a person feels and emotionally responds when they think about, are near/within, or consider issues relating to the ocean, coasts and seas."
      },
      {
        "id": "M8",
        "label": "EXPERIENCE",
        "name": "Access and Experience",
        "description": "Person's real or artificial experiences and engagement with the ocean, and the various ways in which they can access these experiences."
      },
      {
        "id": "M9",
        "label": "ADAPTIVE CAPACITY",
        "name": "Adaptive Capacity",
        "description": null
      },
      {
        "id": "M10",
        "label": "TRUST & TRANSPARENCY",
        "name": "Trust and Transparency",
        "description": "Level of trust a person places in sources of ocean information and knowledge, and their perception of how transparent information and associated platforms and processes are."
      }
    ]
  },
  "F": {
    "key": "F",
    "name": "7-DIMENSIONS MODEL",
    "cite": "Fauville et al., 2024",
    "dimensions": [
      {
        "id": "F1",
        "label": "EMOCEANS",
        "name": "Emoceans",
        "description": "How a person feels and emotionally responds when they think about, are near/within, or consider issues relating to the ocean, coasts and seas.",
        "descriptionSource": "McKinley et al., 2023"
      },
      {
        "id": "F2",
        "label": "ATTITUDE",
        "name": "Attitude",
        "description": "Degree to which a person has a set of values and concerns about the ocean and the motivation to actively contribute to the improvement of ocean health."
      },
      {
        "id": "F3",
        "label": "AWARENESS",
        "name": "Awareness",
        "description": "Degree to which a person is aware of and sensitive to marine environmental issues."
      },
      {
        "id": "F4",
        "label": "OCEAN CONNECTEDNESS",
        "name": "Ocean connectedness",
        "description": "Degree to which a person considers the ocean as part of their identity."
      },
      {
        "id": "F5",
        "label": "BEHAVIOR",
        "name": "Behavior",
        "description": "Degree to which a person engages in actions to minimize their negative impact on the ocean, and to maximize their positive contribution to ocean health."
      },
      {
        "id": "F6",
        "label": "COMMUNICATION",
        "name": "Communication",
        "description": "Degree to which a person engages in informed discussions about the ocean."
      },
      {
        "id": "F7",
        "label": "KNOWLEDGE",
        "name": "Knowledge",
        "description": "Degree to which a person understands the ocean, and marine environmental issues."
      }
    ]
  }
};

export const EDITOR_MODEL_ORDER = ['B', 'M', 'F'];
export const EDITOR_DEFAULT_MODEL = 'M';
