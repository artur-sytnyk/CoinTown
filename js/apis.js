

export const RandomCityApi = {
    async fetchRandomCity() {
        try {
            const response = await fetch('https://random-city-api.vercel.app/api/random-city', {
                headers: {
                    'Accept-Charset': 'UTF-8'
                }
            });
            if (!response.ok) alert.error("Didnt fetch")
            const data = await response.json();
            return data.city.replace(/[^\x00-\x7F]/g, ''); 
        } catch (error) {
            alert.error("Error fetching");
            return "";
        }
    }
};