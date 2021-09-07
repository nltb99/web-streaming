export function customQuery(query) {
    if (!query) {
      return { match_all: {} };
    }
    return { multi_match: { query, type: "phrase", fields: ["title"] } };
  }
  
  export function customQueryMovie(query) {
    if (!query) {
      return { match_all: {} };
    }
    return {
      bool: {
        should: [
          { multi_match: { query, type: "phrase", fields: ["title","fullname","username","email","nickname"] } },
          { multi_match: { query, type: "phrase_prefix", fields: ["title","fullname","username","email","nickname"] } }
        ]
      }
    };
  }
  
  export const url = "/";