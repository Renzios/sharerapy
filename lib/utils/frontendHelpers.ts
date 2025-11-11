export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function validateContactNumber(contact: string) {
  const normalized = contact.replace(/\s+/g, "");
  const regex = /^[0-9-]+$/;
  return regex.test(normalized);
}
