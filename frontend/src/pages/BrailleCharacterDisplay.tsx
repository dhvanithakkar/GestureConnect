
import React from 'react';

interface BrailleCharacterDisplayProps {
  characters: Array<{
    symbol: string;
    letter: string;
    dots: string;
    description?: string;
  }>;
  selectedChar: any;
  setSelectedChar: (char: any) => void;
}

const BrailleCharacterDisplay = ({ characters, selectedChar, setSelectedChar }: BrailleCharacterDisplayProps) => {
  const isAdvancedWord = selectedChar && selectedChar.description;
  
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {characters.map((char) => (
          <div
            key={char.letter}
            className={`p-4 rounded-lg text-center cursor-pointer transition-all ${
              selectedChar === char ? 'bg-yellow-100 border-2 border-yellow-600' : 'bg-gray-50 hover:bg-yellow-50'
            }`}
            onClick={() => setSelectedChar(char)}
          >
            <p className="text-5xl mb-3">{char.symbol}</p>
            <p className="text-lg font-medium">
              {char.description ? `Word: ${char.letter}` : `Letter: ${char.letter.toUpperCase()}`}
            </p>
            <p className="text-sm text-gray-600">Dots: {char.dots}</p>
          </div>
        ))}
      </div>

      {selectedChar && (
        <div className="mt-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="text-xl font-semibold mb-4 text-center">Detail View</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-7xl mb-4">{selectedChar.symbol}</p>
              <p className="text-lg">Braille Symbol</p>
            </div>
            <div className="text-center">
              <p className="text-7xl font-semibold mb-4">{isAdvancedWord ? selectedChar.letter : selectedChar.letter.toUpperCase()}</p>
              <p className="text-lg">{isAdvancedWord ? "English Word" : "Latin Letter"}</p>
            </div>
            
            {!isAdvancedWord && (
              <div className="text-center">
                <div className="relative w-24 h-36 mx-auto mb-4 bg-white border-2 border-gray-300 rounded-lg flex flex-col justify-center items-center">
                  {/* Braille cell container with dots */}
                  <div className="relative w-16 h-24 grid grid-cols-2 gap-2">
                    {/* Dot 1 - Top Left */}
                    <div className={`w-6 h-6 rounded-full ${selectedChar.dots.includes('1') ? 'bg-yellow-600' : 'bg-gray-200'}`}></div>
                    
                    {/* Dot 4 - Top Right */}
                    <div className={`w-6 h-6 rounded-full ${selectedChar.dots.includes('4') ? 'bg-yellow-600' : 'bg-gray-200'}`}></div>
                    
                    {/* Dot 2 - Middle Left */}
                    <div className={`w-6 h-6 rounded-full ${selectedChar.dots.includes('2') ? 'bg-yellow-600' : 'bg-gray-200'}`}></div>
                    
                    {/* Dot 5 - Middle Right */}
                    <div className={`w-6 h-6 rounded-full ${selectedChar.dots.includes('5') ? 'bg-yellow-600' : 'bg-gray-200'}`}></div>
                    
                    {/* Dot 3 - Bottom Left */}
                    <div className={`w-6 h-6 rounded-full ${selectedChar.dots.includes('3') ? 'bg-yellow-600' : 'bg-gray-200'}`}></div>
                    
                    {/* Dot 6 - Bottom Right */}
                    <div className={`w-6 h-6 rounded-full ${selectedChar.dots.includes('6') ? 'bg-yellow-600' : 'bg-gray-200'}`}></div>
                  </div>
                </div>
                <p className="text-lg">Dot Pattern: {selectedChar.dots}</p>
              </div>
            )}
          </div>
          
          {isAdvancedWord && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <p className="font-semibold text-lg mb-2">Word Meaning:</p>
              <p>{selectedChar.description}</p>
              <div className="mt-4">
                <p className="font-medium">Braille Pattern Breakdown:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedChar.dots.split('_').map((dotSet, index) => (
                    <div key={index} className="border border-gray-300 rounded-md px-3 py-1">
                      {dotSet}
                      <span className="text-xs text-gray-500 ml-2">
                        (letter {selectedChar.letter[index] || ''})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-gray-700">
              To write "{isAdvancedWord ? selectedChar.letter : selectedChar.letter.toUpperCase()}" in braille, {isAdvancedWord ? "use the dot patterns shown above" : `press dots ${selectedChar.dots}`}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrailleCharacterDisplay;
