import { useState, useEffect, useRef } from 'react';
import axios from '../services/api';

const EnhancedAddressAutocomplete = ({ 
  value, 
  onChange, 
  placeholder, 
  className,
  required = false 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Fetch suggestions from backend API
  const fetchSuggestions = async (input) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`/locations/search?q=${encodeURIComponent(input)}&limit=8`);
      
      if (response.data && response.data.results) {
        setSuggestions(response.data.results);
        setSelectedIndex(-1); // Reset selection when new suggestions arrive
      } else {
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    } catch (err) {
      console.error('Error fetching location suggestions:', err);
      setError('Failed to load suggestions');
      
      // Fallback to basic suggestions if API fails
      const fallbackSuggestions = [
        'Mumbai, Maharashtra, India',
        'Delhi, India',
        'Bangalore, Karnataka, India',
        'Hyderabad, Telangana, India',
        'Chennai, Tamil Nadu, India',
        'Kolkata, West Bengal, India',
        'Pune, Maharashtra, India',
        'Ahmedabad, Gujarat, India'
      ]
        .filter(location => location.toLowerCase().includes(input.toLowerCase()))
        .slice(0, 5)
        .map((location, index) => ({
          id: `fallback_${index}`,
          description: location,
          main_text: location.split(',')[0].trim(),
          secondary_text: location.split(',').slice(1).join(',').trim(),
          source: 'fallback'
        }));
      
      setSuggestions(fallbackSuggestions);
      setSelectedIndex(-1);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch popular locations when input is focused but empty
  const fetchPopularLocations = async () => {
    try {
      const response = await axios.get('/locations/popular?limit=10');
      
      if (response.data && response.data.results) {
        setSuggestions(response.data.results);
        setSelectedIndex(-1);
      }
    } catch (err) {
      console.error('Error fetching popular locations:', err);
      // Fallback to hardcoded popular locations
      const popularLocations = [
        'Mumbai, Maharashtra, India',
        'Delhi, India',
        'Bangalore, Karnataka, India',
        'Hyderabad, Telangana, India',
        'Chennai, Tamil Nadu, India',
        'Kolkata, West Bengal, India',
        'Pune, Maharashtra, India',
        'Ahmedabad, Gujarat, India',
        'Jaipur, Rajasthan, India',
        'Surat, Gujarat, India'
      ].map((location, index) => ({
        id: `popular_${index}`,
        description: location,
        main_text: location.split(',')[0].trim(),
        secondary_text: location.split(',').slice(1).join(',').trim(),
        source: 'popular'
      }));
      
      setSuggestions(popularLocations);
      setSelectedIndex(-1);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (inputValue.length >= 2) {
      // Debounce API calls to avoid too many requests
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(inputValue);
        setShowSuggestions(true);
      }, 300); // 300ms delay
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    console.log('Suggestion clicked:', suggestion.description); // Temporary debug log
    
    // Update the parent component's state immediately
    onChange(suggestion.description);
    
    // Hide suggestions
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    setError('');
  };

  // Direct click handler for suggestions
  const handleDirectClick = (suggestion, event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('=== SUGGESTION CLICK DEBUG ===');
    console.log('Direct click on:', suggestion.main_text);
    console.log('Full suggestion description:', suggestion.description);
    
    // Immediately hide suggestions to prevent interference
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    setError('');
    
    // Update the input field directly first
    if (inputRef.current) {
      inputRef.current.value = suggestion.description;
      console.log('✅ Input field updated directly to:', suggestion.description);
    }
    
    // Then call onChange to update parent state
    if (typeof onChange === 'function') {
      console.log('✅ Calling onChange with:', suggestion.description);
      onChange(suggestion.description);
    } else {
      console.error('❌ onChange is not a function!', onChange);
    }
    
    console.log('=== END SUGGESTION CLICK DEBUG ===');
  };

  // Handle input blur
  const handleBlur = (e) => {
    // Don't hide suggestions immediately - let click events complete first
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150); // Reduced delay but still enough for click events
  };

  // Handle input focus
  const handleFocus = () => {
    if (value.length === 0) {
      // Show popular locations when input is empty
      fetchPopularLocations();
      setShowSuggestions(true);
    } else if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSuggestionClick(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Sync input value with prop value
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
      console.log('🔄 Syncing input value with prop:', value);
    }
  }, [value]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        required={required}
        autoComplete="off"
      />
      
      {/* Debug: Test onChange button */}
      {process.env.NODE_ENV === 'development' && (
        <button
          type="button"
          onClick={() => {
            console.log('🧪 Test button clicked - calling onChange with test value');
            onChange('TEST ADDRESS FROM BUTTON');
          }}
          className="absolute right-0 top-0 bg-red-500 text-white text-xs px-2 py-1 rounded"
          style={{ zIndex: 1000 }}
        >
          TEST
        </button>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onMouseDown={(e) => {
                // Handle selection on mouseDown to prevent blur interference
                handleDirectClick(suggestion, e);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                selectedIndex === index 
                  ? 'bg-blue-100 text-blue-900' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="font-medium text-gray-900">
                {suggestion.main_text}
              </div>
              {suggestion.secondary_text && (
                <div className="text-sm text-gray-600 mt-1">
                  {suggestion.secondary_text}
                </div>
              )}
              {suggestion.source && (
                <div className="text-xs text-blue-500 mt-1">
                  {suggestion.source === 'popular' && '⭐ Popular'}
                  {suggestion.source === 'local' && '📍 Local'}
                  {suggestion.source === 'nominatim' && '🌍 Map Data'}
                  {suggestion.source === 'fallback' && '💾 Cached'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute z-50 w-full mt-1 bg-red-50 border border-red-300 rounded-md p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* No results message */}
      {value.length >= 2 && suggestions.length === 0 && !isLoading && !error && (
        <div className="absolute z-50 w-full mt-1 bg-blue-50 border border-blue-300 rounded-md p-3 text-sm text-blue-800">
          No locations found. Try typing a different city or area name.
        </div>
      )}

      {/* Help text for empty input */}
      {showSuggestions && value.length === 0 && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-green-50 border border-green-300 rounded-md p-2 text-xs text-green-700">
          Popular locations - or start typing to search
        </div>
      )}
    </div>
  );
};

export default EnhancedAddressAutocomplete;
