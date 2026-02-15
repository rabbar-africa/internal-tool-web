export const riskAssesmentsCalculator = (currentProcessingActivity?: any) => {
  let score = 0;
  let numberOfRiskIndicator = 0;
  let riskLevel = "Low";
  let dpiaRequired = false;
  let tiaRequired = false;
  let liaRequired = false;

  // Calculate score
  if (currentProcessingActivity?.processSensitiveData === "yes") {
    score += 3;
    numberOfRiskIndicator += 1;
  }
  if (currentProcessingActivity?.automatedDecision === "yes") {
    score += 3;
    numberOfRiskIndicator += 1;
  }
  if (currentProcessingActivity?.processLargeScalePersonalData === "yes") {
    score += 2;
    numberOfRiskIndicator += 1;
  }
  if (currentProcessingActivity?.crossBorderTransfer === "yes") {
    score += 2;
    numberOfRiskIndicator += 1;
  }
  if (currentProcessingActivity?.dataSubjectCategoryIds?.length > 0) {
    currentProcessingActivity?.dataSubjectCategoryIds?.forEach((element) => {
      score += element?.score || 0;
    });
  }
  if (currentProcessingActivity?.legalBasis?.length > 0) {
    currentProcessingActivity?.legalBasis?.forEach((element) => {
      score += element?.score || 0;
    });
  }

  // Action Recommendation
  // DPIA
  if (score >= 5) {
    dpiaRequired = true;
  }
  // TIA
  if (currentProcessingActivity?.crossBorderTransfer === "yes") {
    tiaRequired = true;
  }
  // LIA
  if (
    currentProcessingActivity?.legalBasis?.find(
      (item) => item.title === "Legitimate Interests",
    )
  ) {
    liaRequired = true;
  }

  // Risk Level
  if (score > 0 && score <= 2) {
    riskLevel = "Low";
  }
  if (score > 2 && score <= 4) {
    riskLevel = "Medium";
    liaRequired = true;
  }
  if (score > 4 && score <= 6) {
    riskLevel = "High";
    dpiaRequired = true;
  }
  if (score >= 7) {
    riskLevel = "Very High";
    dpiaRequired = true;
  }

  // Build hint string with proper English
  const actions: string[] = [];
  if (dpiaRequired) actions.push("Data Protection Impact Assessment (DPIA)");
  if (tiaRequired) actions.push("Transfer Impact Assessment (TIA)");
  if (liaRequired) actions.push("Legitimate Interests Assessment (LIA)");

  let hintString = "";
  if (actions.length === 1) {
    hintString = `A ${actions[0]} is recommended`;
  } else if (actions.length === 2) {
    hintString = `A ${actions[0]} and ${actions[1]} are recommended`;
  } else if (actions.length === 3) {
    hintString = `A ${actions[0]}, ${actions[1]}, and ${actions[2]} are recommended`;
  }

  return {
    score,
    riskLevel,
    dpiaRequired,
    tiaRequired,
    liaRequired,
    numberOfRiskIndicator,
    hintString,
  };
};
