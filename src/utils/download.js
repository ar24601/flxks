export const handleDownload = async () => {
    try {
        // Fetch the signed, 60-second expiring download link from our bouncer
        const response = await fetch('/api/get-download-link.php');
        const data = await response.json();
        
        if (data.success && data.url) {
            // Instantly redirect the browser to the secure download endpoint.
            // The link is valid for 60 seconds, preventing hotlinking.
            window.location.href = data.url;
        } else {
            console.error("Failed to get download link", data);
            alert("Sorry, we couldn't generate a secure download link right now. Please try again.");
        }
    } catch (err) {
        console.error("Download error:", err);
        alert("Sorry, an error occurred while connecting to the download server.");
    }
};
