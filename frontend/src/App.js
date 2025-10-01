import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

// TheCocktailDB API Base
const COCKTAIL_API = "https://www.thecocktaildb.com/api/json/v1/1";

// Homepage Component
const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="disco-page home-page">
      <div className="disco-ball-container">
        <div className="disco-ball">
          <div className="disco-ball-light"></div>
          {[...Array(20)].map((_, i) => (
            <div key={i} className="disco-square" style={{
              transform: `rotateY(${i * 18}deg) translateZ(100px)`
            }}></div>
          ))}
        </div>
      </div>

      <div className="home-content">
        <h1 className="neon-text disco-title">Disco Cocktails</h1>
        <p className="disco-subtitle">Discover amazing cocktails by ingredient</p>
        <button
          className="disco-button"
          onClick={() => navigate('/ingredients')}
        >
          Start Exploring
        </button>
      </div>

      <div className="disco-lights">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="disco-light" style={{
            left: `${15 + i * 15}%`,
            animationDelay: `${i * 0.3}s`
          }}></div>
        ))}
      </div>
    </div>
  );
};

// Ingredients Page Component
const IngredientsPage = () => {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [cocktails, setCocktails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${COCKTAIL_API}/list.php?i=list`);
      setIngredients(response.data.drinks || []);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientClick = async (ingredient) => {
    setSelectedIngredient(ingredient);
    try {
      const response = await axios.get(`${COCKTAIL_API}/filter.php?i=${ingredient.strIngredient1}`);
      setCocktails(response.data.drinks || []);
    } catch (error) {
      console.error("Error fetching cocktails:", error);
      setCocktails([]);
    }
  };

  const filteredIngredients = ingredients.filter(ing =>
    ing.strIngredient1.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="disco-page ingredients-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1 className="neon-text page-title">Choose Your Ingredient</h1>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="disco-search"
        />
      </div>

      <div className="content-grid">
        <div className="ingredients-section">
          <h2 className="section-title">Ingredients</h2>
          {loading ? (
            <div className="loading">Loading ingredients...</div>
          ) : (
            <div className="ingredients-grid">
              {filteredIngredients.map((ingredient, index) => (
                <div
                  key={index}
                  className={`ingredient-card ${selectedIngredient?.strIngredient1 === ingredient.strIngredient1 ? 'active' : ''}`}
                  onClick={() => handleIngredientClick(ingredient)}
                >
                  <div className="ingredient-icon">🍹</div>
                  <div className="ingredient-name">{ingredient.strIngredient1}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedIngredient && (
          <div className="cocktails-section">
            <h2 className="section-title">
              Cocktails with {selectedIngredient.strIngredient1}
            </h2>
            <div className="cocktails-grid">
              {cocktails.length === 0 ? (
                <div className="no-results">No cocktails found</div>
              ) : (
                cocktails.map((cocktail) => (
                  <div
                    key={cocktail.idDrink}
                    className="cocktail-card"
                    onClick={() => navigate(`/cocktail/${cocktail.idDrink}`)}
                  >
                    <img
                      src={cocktail.strDrinkThumb}
                      alt={cocktail.strDrink}
                      className="cocktail-image"
                    />
                    <div className="cocktail-name">{cocktail.strDrink}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="disco-lights">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="disco-light" style={{
            left: `${15 + i * 15}%`,
            animationDelay: `${i * 0.3}s`
          }}></div>
        ))}
      </div>
    </div>
  );
};

// Cocktail Details Page Component
const CocktailDetailsPage = () => {
  const { id } = useParams();
  const [cocktail, setCocktail] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCocktailDetails();
  }, [id]);

  const fetchCocktailDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${COCKTAIL_API}/lookup.php?i=${id}`);
      setCocktail(response.data.drinks?.[0] || null);
    } catch (error) {
      console.error("Error fetching cocktail details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="disco-page">
        <div className="loading">Loading cocktail details...</div>
      </div>
    );
  }

  if (!cocktail) {
    return (
      <div className="disco-page">
        <div className="error">Cocktail not found</div>
        <button className="disco-button" onClick={() => navigate('/ingredients')}>
          Back to Ingredients
        </button>
      </div>
    );
  }

  // Extract ingredients and measures
  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const ingredient = cocktail[`strIngredient${i}`];
    const measure = cocktail[`strMeasure${i}`];
    if (ingredient) {
      ingredients.push({ ingredient, measure: measure || '' });
    }
  }

  return (
    <div className="disco-page details-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate('/ingredients')}>
          ← Back to Ingredients
        </button>
        <h1 className="neon-text page-title">{cocktail.strDrink}</h1>
      </div>

      <div className="details-container">
        <div className="details-image-section">
          <img
            src={cocktail.strDrinkThumb}
            alt={cocktail.strDrink}
            className="details-image"
          />
          <div className="details-meta">
            <div className="meta-item">
              <span className="meta-label">Category:</span>
              <span className="meta-value">{cocktail.strCategory}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Glass:</span>
              <span className="meta-value">{cocktail.strGlass}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Type:</span>
              <span className="meta-value">{cocktail.strAlcoholic}</span>
            </div>
            {cocktail.strTags && (
              <div className="meta-item">
                <span className="meta-label">Tags:</span>
                <span className="meta-value">{cocktail.strTags}</span>
              </div>
            )}
          </div>
        </div>

        <div className="details-info-section">
          <div className="ingredients-box">
            <h2 className="section-title">Ingredients</h2>
            <ul className="ingredients-list">
              {ingredients.map((item, index) => (
                <li key={index} className="ingredient-item">
                  <span className="ingredient-measure">{item.measure}</span>
                  <span className="ingredient-text">{item.ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="instructions-box">
            <h2 className="section-title">Instructions</h2>
            <p className="instructions-text">{cocktail.strInstructions}</p>
          </div>
        </div>
      </div>

      <div className="disco-lights">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="disco-light" style={{
            left: `${15 + i * 15}%`,
            animationDelay: `${i * 0.3}s`
          }}></div>
        ))}
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ingredients" element={<IngredientsPage />} />
          <Route path="/cocktail/:id" element={<CocktailDetailsPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
