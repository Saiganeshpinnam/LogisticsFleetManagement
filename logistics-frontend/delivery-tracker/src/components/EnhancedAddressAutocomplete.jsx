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
  const [isSelectingSuggestion, setIsSelectingSuggestion] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const blurTimeoutRef = useRef(null);

  // Fetch suggestions from backend API with enhanced Google Maps-like behavior
  const fetchSuggestions = async (input) => {
    if (input.length < 1) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError('');

    // Always set some immediate fallback suggestions first with enhanced filtering - now global
    const immediateFallback = [
      // India
      'Mumbai, Maharashtra, India',
      'Andheri East, Mumbai, Maharashtra, India',
      'Andheri West, Mumbai, Maharashtra, India',
      'Delhi, India',
      'Connaught Place, New Delhi, Delhi, India',
      'Bangalore, Karnataka, India',
      'Whitefield, Bangalore, Karnataka, India',
      'Hyderabad, Telangana, India',
      'Banjara Hills, Hyderabad, Telangana, India',

      // USA
      'New York, NY, USA',
      'Manhattan, New York, NY, USA',
      'Los Angeles, CA, USA',
      'Beverly Hills, Los Angeles, CA, USA',
      'Chicago, IL, USA',
      'San Francisco, CA, USA',
      'Miami, FL, USA',

      // UK
      'London, England, UK',
      'Manchester, England, UK',

      // Canada
      'Toronto, ON, Canada',
      'Vancouver, BC, Canada',

      // Australia
      'Sydney, NSW, Australia',
      'Melbourne, VIC, Australia',

      // UAE
      'Dubai, UAE',
      'Abu Dhabi, UAE',

      // Singapore
      'Singapore',
      'Orchard Road, Singapore',

      // Europe
      'Paris, France',
      'Berlin, Germany',
      'Amsterdam, Netherlands'
    ]
      .filter(location => {
        const locationLower = location.toLowerCase();
        const searchQueryLower = input.toLowerCase();

        // Enhanced matching logic similar to backend
        const locationParts = locationLower.split(',');
        const cityName = locationParts[0]?.trim();
        const areaName = locationParts.length > 1 ? locationParts[1]?.trim() : '';
        const stateName = locationParts.length > 2 ? locationParts[2]?.trim() : '';
        const countryName = locationParts.length > 3 ? locationParts[3]?.trim() : '';

        // Check for exact area matches
        if (areaName && areaName.includes(searchQueryLower)) return true;

        // Check for partial area matches
        if (areaName && searchQueryLower.split(' ').some(part =>
          areaName.includes(part) || part.includes(areaName.split(' ')[0])
        )) return true;

        // Check for city matches
        if (cityName.startsWith(searchQueryLower) || cityName.includes(searchQueryLower)) return true;

        // Check for state/province matches
        if (stateName && stateName.includes(searchQueryLower)) return true;

        // Check for country matches
        if (countryName && countryName.includes(searchQueryLower)) return true;

        // Check for any part of the location
        return locationLower.includes(searchQueryLower) ||
               locationLower.split(',').some(part => part.trim().startsWith(searchQueryLower));
      })
      .slice(0, 8)
      .map((location, index) => {
        const locationParts = location.split(',');
        const cityName = locationParts[0]?.trim();
        const areaName = locationParts.length > 1 ? locationParts[1]?.trim() : '';
        const stateName = locationParts.length > 2 ? locationParts[2]?.trim() : '';
        const countryName = locationParts.length > 3 ? locationParts[3]?.trim() : '';

        return {
          id: `immediate_${index}`,
          description: location, // Full clean address name
          main_text: areaName ? `${areaName}, ${cityName}` : cityName,
          secondary_text: [stateName, countryName].filter(Boolean).join(', '),
          source: 'immediate',
          icon: areaName ? '🏘️' : '🏙️', // Area or city icon based on specificity
          city: cityName,
          area: areaName,
          state: stateName,
          country: countryName,
          displayText: location, // Clean location name for display
          structured_formatting: {
            main_text: areaName ? `${areaName}, ${cityName}` : cityName,
            secondary_text: [stateName, countryName].filter(Boolean).join(', ')
          }
        };
      });

    setSuggestions(immediateFallback);
    setSelectedIndex(-1);

    try {
      const response = await axios.get(`/locations/search?q=${encodeURIComponent(input)}&limit=20`);

      if (response.data && response.data.results && response.data.results.length > 0) {
        const enhancedSuggestions = response.data.results.map(suggestion => {
          // Determine icon based on location type and source
          let icon = '📍'; // Default icon
          if (suggestion.area || (suggestion.main_text && suggestion.main_text.includes(','))) {
            icon = '🏘️'; // Area/neighborhood icon
          } else if (suggestion.city) {
            icon = '🏙️'; // City icon
          } else if (suggestion.source === 'google_places') {
            icon = '🌐'; // Google Places icon
          } else if (suggestion.source === 'local') {
            icon = '🏛️'; // Local database icon
          } else if (suggestion.source === 'popular') {
            icon = '⭐'; // Popular location icon
          }

          return {
            ...suggestion,
            icon,
            // Enhanced display formatting - use backend structured data if available
            displayText: suggestion.structured_formatting ?
              `${suggestion.structured_formatting.main_text}, ${suggestion.structured_formatting.secondary_text}` :
              suggestion.description,
            // Use backend-provided main_text and secondary_text directly
            main_text: suggestion.structured_formatting?.main_text || suggestion.main_text,
            secondary_text: suggestion.structured_formatting?.secondary_text || suggestion.secondary_text,
            // Ensure structured_formatting is always available for consistent display
            structured_formatting: suggestion.structured_formatting || {
              main_text: suggestion.main_text || suggestion.description.split(',')[0]?.trim() || suggestion.description,
              secondary_text: suggestion.secondary_text || suggestion.description.split(',').slice(1).join(',').trim() || 'India'
            }
          };
        });

        setSuggestions(enhancedSuggestions);
        setSelectedIndex(-1);
        console.log(`✅ Loaded ${enhancedSuggestions.length} location suggestions for "${input}"`);
      } else {
        // Keep the immediate fallback suggestions
        console.log('⚠️ No API results, keeping fallback suggestions');
      }
    } catch (err) {
      console.error('Error fetching location suggestions:', err);
      // Keep the immediate fallback suggestions on error
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch popular locations when input is focused but empty
  const fetchPopularLocations = async () => {
    // Show hardcoded popular locations immediately for better UX - now global
    const immediatePopularLocations = [
      // India
      'Mumbai, Maharashtra, India',
      'Andheri East, Mumbai, Maharashtra, India',
      'Andheri West, Mumbai, Maharashtra, India',
      'Delhi, India',
      'Connaught Place, New Delhi, Delhi, India',
      'Bangalore, Karnataka, India',
      'Whitefield, Bangalore, Karnataka, India',
      'Hyderabad, Telangana, India',
      'Banjara Hills, Hyderabad, Telangana, India',

      // USA
      'New York, NY, USA',
      'Manhattan, New York, NY, USA',
      'Los Angeles, CA, USA',
      'Beverly Hills, Los Angeles, CA, USA',
      'Chicago, IL, USA',
      'San Francisco, CA, USA',
      'Miami, FL, USA',

      // UK
      'London, England, UK',
      'Manchester, England, UK',
      'Birmingham, England, UK',

      // Canada
      'Toronto, ON, Canada',
      'Vancouver, BC, Canada',
      'Montreal, QC, Canada',

      // Australia
      'Sydney, NSW, Australia',
      'Melbourne, VIC, Australia',
      'Brisbane, QLD, Australia',

      // UAE
      'Dubai, UAE',
      'Abu Dhabi, UAE',
      'Sharjah, UAE',

      // Singapore
      'Singapore',
      'Orchard Road, Singapore',

      // Europe
      'Paris, France',
      'Berlin, Germany',
      'Amsterdam, Netherlands',
      'Barcelona, Spain',
      'Rome, Italy',
      'Vienna, Austria'
    ].map((location, index) => {
      const locationParts = location.split(',');
      const cityName = locationParts[0]?.trim();
      const areaName = locationParts.length > 1 ? locationParts[1]?.trim() : '';
      const stateName = locationParts.length > 2 ? locationParts[2]?.trim() : '';
      const countryName = locationParts.length > 3 ? locationParts[3]?.trim() : '';

      return {
        id: `popular_${index}`,
        description: location, // Full clean address name
        main_text: areaName ? `${areaName}, ${cityName}` : cityName,
        secondary_text: [stateName, countryName].filter(Boolean).join(', '),
        source: 'popular',
        icon: areaName ? '🏘️' : '🏙️', // Area or city icon based on specificity
        city: cityName,
        area: areaName,
        state: stateName,
        country: countryName,
        displayText: location, // Clean location name for display
        structured_formatting: {
          main_text: areaName ? `${areaName}, ${cityName}` : cityName,
          secondary_text: [stateName, countryName].filter(Boolean).join(', ')
        }
      };
    });

    setSuggestions(immediatePopularLocations);
    setSelectedIndex(-1);

    // Then try to fetch from API in the background
    try {
      const response = await axios.get('/locations/popular?limit=10');

      if (response.data && response.data.results) {
        setSuggestions(response.data.results);
        setSelectedIndex(-1);
      }
    } catch (err) {
      console.error('Error fetching popular locations:', err);
      // Keep the immediate suggestions since they work
    }
  };

  // Handle input change with debouncing (enhanced for Google Maps-like behavior)
  const handleInputChange = (e) => {
    const inputValue = e.target.value;

    onChange(inputValue);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (inputValue.length >= 1) {
      // Faster debounce for better responsiveness (like Google Maps)
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(inputValue);
        setShowSuggestions(true);
      }, inputValue.length <= 2 ? 200 : 350); // Optimized timing for better UX
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    // Set selecting state to prevent blur from hiding suggestions
    setIsSelectingSuggestion(true);

    // Use structured formatting if available, otherwise use description
    const cleanAddress = suggestion.structured_formatting ?
      `${suggestion.structured_formatting.main_text}, ${suggestion.structured_formatting.secondary_text}` :
      suggestion.description;

    // Update the parent component's state immediately
    onChange(cleanAddress);

    // Hide suggestions
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    setError('');

    // Reset selecting state after a short delay
    setTimeout(() => {
      setIsSelectingSuggestion(false);
    }, 100);
  };

  // Direct click handler for suggestions
  const handleDirectClick = (suggestion, event) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();

    // Set selecting state to prevent blur from hiding suggestions
    setIsSelectingSuggestion(true);

    // Immediately hide suggestions to prevent interference
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    setError('');

    // Use structured formatting if available, otherwise use description
    const cleanAddress = suggestion.structured_formatting ?
      `${suggestion.structured_formatting.main_text}, ${suggestion.structured_formatting.secondary_text}` :
      suggestion.description;

    // Update the input field directly first
    if (inputRef.current) {
      inputRef.current.value = cleanAddress;
    }

    // Then call onChange to update parent state
    if (typeof onChange === 'function') {
      onChange(cleanAddress);
    }

    // Reset selecting state after a short delay
    setTimeout(() => {
      setIsSelectingSuggestion(false);
    }, 100);
  };

  // Handle input blur
  const handleBlur = (e) => {
    // Clear any existing timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }

    // Check if the blur is happening because of a click on a suggestion
    const relatedTarget = e.relatedTarget;
    const isClickingSuggestion = relatedTarget && (
      relatedTarget.closest('.suggestions-dropdown') ||
      relatedTarget.classList.contains('suggestions-dropdown')
    );

    if (!isClickingSuggestion && !isSelectingSuggestion) {
      // Delay hiding suggestions to allow click events to complete
      blurTimeoutRef.current = setTimeout(() => {
        // Only hide if we're still not selecting a suggestion and not clicking on suggestions
        if (!isSelectingSuggestion) {
          setShowSuggestions(false);
          setSelectedIndex(-1);
        }
      }, 200);
    }
  };

  // Handle input focus
  const handleFocus = () => {
    // Always show popular locations when input is focused
    fetchPopularLocations();
    setShowSuggestions(true);
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
        const suggestion = suggestions[selectedIndex];
        const cleanAddress = suggestion.structured_formatting ?
          `${suggestion.structured_formatting.main_text}, ${suggestion.structured_formatting.secondary_text}` :
          suggestion.description;
        handleSuggestionClick({ ...suggestion, description: cleanAddress });
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
    }
  }, [value]);

  // Cleanup debounce and blur timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
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
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Suggestions dropdown with enhanced Google Maps-like styling */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDirectClick(suggestion, e);
              }}
              onMouseDown={(e) => {
                // Prevent blur event from firing during mousedown
                e.preventDefault();
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-150 ${
                selectedIndex === index
                  ? 'bg-blue-50 text-blue-900 border-l-4 border-l-blue-500'
                  : 'hover:bg-gray-50 hover:border-l-4 hover:border-l-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Icon based on source */}
                <div className="flex-shrink-0 mt-0.5">
                  <span className="text-lg">{suggestion.icon}</span>
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 leading-tight">
                    {suggestion.structured_formatting?.main_text || suggestion.main_text}
                  </div>
                  {suggestion.structured_formatting?.secondary_text && (
                    <div className="text-sm text-gray-600 mt-1 leading-tight">
                      {suggestion.structured_formatting.secondary_text}
                    </div>
                  )}
                  {suggestion.secondary_text && !suggestion.structured_formatting?.secondary_text && (
                    <div className="text-sm text-gray-600 mt-1 leading-tight">
                      {suggestion.secondary_text}
                    </div>
                  )}

                  {/* Source indicator */}
                  <div className="flex items-center mt-2 space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      suggestion.source === 'google_places' ? 'bg-green-100 text-green-800' :
                      suggestion.source === 'google_places_basic' ? 'bg-blue-100 text-blue-800' :
                      suggestion.source === 'local' ? 'bg-purple-100 text-purple-800' :
                      suggestion.source === 'nominatim_enhanced' ? 'bg-orange-100 text-orange-800' :
                      suggestion.source === 'popular' ? 'bg-yellow-100 text-yellow-800' :
                      suggestion.source === 'immediate' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {(() => {
                        // Show the actual location/place name the user searched for
                        // Priority: Use the main location name/area, then city, then full description
                        const locationName = suggestion.area || 
                                           suggestion.main_text?.split(',')[0]?.trim() ||
                                           suggestion.city || 
                                           suggestion.description?.split(',')[0]?.trim();
                        
                        const locationRegion = suggestion.country || suggestion.state;
                        
                        if (locationName && locationRegion) {
                          return `${locationName}, ${locationRegion}`;
                        }
                        
                        if (locationName) {
                          return locationName;
                        }
                        
                        // Fallback to structured formatting
                        if (suggestion.structured_formatting?.main_text && suggestion.structured_formatting?.secondary_text) {
                          return `${suggestion.structured_formatting.main_text}, ${suggestion.structured_formatting.secondary_text}`;
                        }
                        
                        return suggestion.description || 'Location';
                      })()}
                    </span>

                    {/* Coordinates - hidden from user view */}
                    {false && suggestion.latitude && suggestion.longitude && (
                      <span className="text-xs text-gray-500">
                        {suggestion.latitude.toFixed(4)}, {suggestion.longitude.toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow indicator for selected item */}
                {selectedIndex === index && (
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute z-50 w-full mt-1 bg-red-50 border border-red-300 rounded-md p-3 text-sm text-red-800">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <span className="text-lg">❌</span>
            </div>
            <div>
              <div className="font-medium mb-1">Error loading suggestions</div>
              <div className="text-xs text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Always show help text when no suggestions and not loading */}
      {!error && value.length >= 1 && suggestions.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-blue-50 border border-blue-300 rounded-lg p-4 text-sm text-blue-800">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <span className="text-lg">💡</span>
            </div>
            <div>
              <div className="font-medium mb-1">Try searching for:</div>
              <div className="text-xs text-blue-700">
                <div className="mt-2 space-y-1 text-xs">
                  <div>• "New York" → New York, NY, USA</div>
                  <div>• "London" → London, England, UK</div>
                  <div>• "Toronto" → Toronto, ON, Canada</div>
                  <div>• "Sydney" → Sydney, NSW, Australia</div>
                  <div>• "Dubai" → Dubai, UAE</div>
                  <div>• "Singapore" → Singapore</div>
                  <div>• "Paris" → Paris, France</div>
                  <div>• "Mumbai" → Andheri, Mumbai, India</div>
                </div>
              </div>
            </div>
          </div>
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
