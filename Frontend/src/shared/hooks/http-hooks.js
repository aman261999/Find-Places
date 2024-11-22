import { useState, useCallback, useRef, useEffect } from "react"; //useCallback is used to avoid infine loops 

export const useHttpClient = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();

    const activeHttpRequest = useRef([]);

    const sendRequest = useCallback( async (url, method = 'GET', body = null, headers = {}) => {
        
        setIsLoading(true);
        const httpAbbortCtrl = new AbortController();
        activeHttpRequest.current.push(httpAbbortCtrl);

        try {
            const response = await fetch(url, {
                method,
                body,
                headers,
                signal: httpAbbortCtrl.signal
            });
    
            const responseData = await response.json();

            activeHttpRequest.current = activeHttpRequest.current.filter(
                reqCtrl => reqCtrl !== httpAbbortCtrl
            );
    
            if (!response.ok) {  //for 400 and 500 response code this if statement means 
              throw new Error(responseData.message);
            }

            setIsLoading(false);
            return responseData;
            
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
        
    }, []);

    const clearError = () => {
        setError(null);
    };

    useEffect(() => {
        return () => {
            activeHttpRequest.current.forEach(abortCtrl => abortCtrl.abbort());
        };    
    }, []);

    return { isLoading, error, sendRequest , clearError};
};