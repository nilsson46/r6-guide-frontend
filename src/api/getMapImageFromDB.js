export async function fetchMapImage(id) {
  const response = await fetch(`http://localhost:8090/api/maps/${id}/image`);
  if (!response.ok) {
    throw new Error("Image not found");
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}