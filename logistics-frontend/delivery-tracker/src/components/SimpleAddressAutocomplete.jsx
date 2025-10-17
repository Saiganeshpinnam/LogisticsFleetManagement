import { useState, useEffect } from 'react';

const SimpleAddressAutocomplete = ({ 
  value, 
  onChange, 
  placeholder, 
  className,
  required = false 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Common Indian cities and areas for suggestions
  const commonPlaces = [
    'Mumbai, Maharashtra, India',
    'Delhi, India',
    'Bangalore, Karnataka, India',
    'Hyderabad, Telangana, India',
    'Chennai, Tamil Nadu, India',
    'Kolkata, West Bengal, India',
    'Pune, Maharashtra, India',
    'Ahmedabad, Gujarat, India',
    'Jaipur, Rajasthan, India',
    'Surat, Gujarat, India',
    'Lucknow, Uttar Pradesh, India',
    'Kanpur, Uttar Pradesh, India',
    'Nagpur, Maharashtra, India',
    'Indore, Madhya Pradesh, India',
    'Thane, Maharashtra, India',
    'Bhopal, Madhya Pradesh, India',
    'Visakhapatnam, Andhra Pradesh, India',
    'Pimpri-Chinchwad, Maharashtra, India',
    'Patna, Bihar, India',
    'Vadodara, Gujarat, India'
  ];

  // Fetch suggestions using OpenStreetMap Nominatim (free)
  const fetchSuggestions = async (input) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // First, check common places for quick suggestions
      const localSuggestions = commonPlaces
        .filter(place => place.toLowerCase().includes(input.toLowerCase()))
        .slice(0, 3);

      // Then fetch from Nominatim
      const encodedInput = encodeURIComponent(input + ', India');
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedInput}&limit=5&countrycodes=in`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'LogisticsFleetApp/1.0'
        }
      });
      
      const data = await response.json();
      
      const nominatimSuggestions = data.map(item => ({
        description: item.display_name,
        place_id: item.place_id,
        main_text: item.name || item.display_name.split(',')[0],
        secondary_text: item.display_name.split(',').slice(1).join(',').trim()
      }));

      // Combine local and API suggestions
      const combinedSuggestions = [
        ...localSuggestions.map(place => ({
          description: place,
          place_id: `local_${place}`,
          main_text: place.split(',')[0],
          secondary_text: place.split(',').slice(1).join(',').trim()
        })),
        ...nominatimSuggestions
      ].slice(0, 5);

      setSuggestions(combinedSuggestions);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      
      // Fallback to local suggestions only
      const localSuggestions = commonPlaces
        .filter(place => place.toLowerCase().includes(input.toLowerCase()))
        .slice(0, 5)
        .map(place => ({
          description: place,
          place_id: `local_${place}`,
          main_text: place.split(',')[0],
          secondary_text: place.split(',').slice(1).join(',').trim()
        }));
      
      setSuggestions(localSuggestions);
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    
    if (inputValue.length >= 3) {
      fetchSuggestions(inputValue);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion.description);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Handle input blur
  const handleBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Handle input focus
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={className}
        required={required}
        autoComplete="off"
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-gray-900">
                {suggestion.main_text}
              </div>
              {suggestion.secondary_text && (
                <div className="text-sm text-gray-600 mt-1">
                  {suggestion.secondary_text}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info message */}
      {value.length >= 3 && suggestions.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-blue-50 border border-blue-300 rounded-md p-3 text-sm text-blue-800">
          Type more characters for better suggestions
        </div>
      )}
    </div>
  );
};

export default SimpleAddressAutocomplete;
