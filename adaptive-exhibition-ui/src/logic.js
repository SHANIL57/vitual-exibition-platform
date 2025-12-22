export const interactionWeights = {
  view: 1,
  download: 3,
  compare: 2
};

export function calculateBoothScore(score, action) {
  return score + interactionWeights[action];
}

export function calculateLeadScore(lead) {
  return (
    lead.time * 0.4 +
    lead.downloads * 30 +
    lead.compares * 20
  );
}
