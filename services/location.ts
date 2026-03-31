
// CONVERTE UM ENDEREÇO EM COORDENADAS GEOGRÁFICAS
export async function getCoordinatesFromAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
        const encodedAddress = encodeURIComponent(address);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'TCCApp/1.0', // Nominatim requires a User-Agent
            },
        });

        const data = await response.json();

        if (data && data.length > 0) {
            const latitude = parseFloat(data[0].lat);
            const longitude = parseFloat(data[0].lon);
            return { latitude, longitude };
        }

        return null;
    } catch (error) {
        console.error("Error geocoding address:", error);
        return null;
    }
}
