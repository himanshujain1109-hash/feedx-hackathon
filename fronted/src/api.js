const API_URL = https://feedx-hackathon-2.onrender.com;

useEffect(() => {
  fetch(`${API_URL}/api/listings`)
    .then((res) => res.json())
    .then((data) => {
      setListings(data);
    })
    .catch((error) => {
      console.error(error);
    });
}, []);
