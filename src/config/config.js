const configs = {
    BASE_URL: "http://localhost:8001/",
    BASE_URL_AUTO: process.env.REACT_APP_APIGW_BASE_URL
      ? process.env.REACT_APP_APIGW_BASE_URL
      : "http://localhost:8001"
  };
  
  export default configs;
