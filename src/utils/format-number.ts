export function addComma(value: any) {
  // Ensure the value is a number
  if (isNaN(value)) {
    return "Invalid number";
  }

  // Convert the value to a number
  const numberValue = Number(value);

  // Check if the number is an integer
  if (Number.isInteger(numberValue)) {
    // Format the integer part with commas
    return numberValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    // Round to two decimal places and convert to string
    const formattedValue = numberValue.toFixed(2);

    // Split the integer and decimal parts
    const parts = formattedValue.split(".");

    // Add commas to the integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Join the integer and decimal parts
    return parts.join(".");
  }
}

export const formatAmount = (amount: number, currency?: string) => {
  return `${currency || "NGN"} ${addComma(amount)}`;
};
