const configs = {
    BASE_URL: "https://backend.chitralekha.ai4bharat.org/",
    BASE_URL_AUTO: process.env.REACT_APP_APIGW_BASE_URL
      ? process.env.REACT_APP_APIGW_BASE_URL
      : "https://backend.chitralekha.ai4bharat.org"
  };
  
  export default configs;