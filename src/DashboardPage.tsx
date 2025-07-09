import { useState, useEffect } from 'react';
import Navbar from './Navbar';

interface MealComponent {
  name: string;
  calories: number;
  fat_g: number;
  protein_g: number;
  carbs_g: number;
}

interface MealSummary {
  mealId: string;
  meal_date: string;
  description: string;
  total_calories: number;
}

interface MealDetail {
  mealId: string;
  meal_date: string;
  description: string;
  components: MealComponent[];
}

function DashboardPage() {
  const [description, setDescription] = useState('');
  const [components, setComponents] = useState<MealComponent[]>([]);
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Meal history state
  const [meals, setMeals] = useState<MealSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  // Meal detail state
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [mealDetail, setMealDetail] = useState<MealDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editComponents, setEditComponents] = useState<MealComponent[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Update: fetch meals on mount
  useEffect(() => {
    fetchMeals();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (selectedMealId) {
      fetchMealDetail(selectedMealId);
    }
    // eslint-disable-next-line
  }, [selectedMealId]);

  const fetchMeals = async () => {
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await fetch(`${(window as any).configs.apiUrl}/api/meals/`, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch meals.');
      }
      const data = await res.json();
      setMeals(data);
    } catch (err: any) {
      setHistoryError(err.message || 'Failed to fetch meals.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchMealDetail = async (mealId: string) => {
    setDetailLoading(true);
    setDetailError('');
    setMealDetail(null);
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await fetch(`${(window as any).configs.apiUrl}/api/meals/${mealId}`, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch meal details.');
      }
      const data = await res.json();
      setMealDetail(data);
    } catch (err: any) {
      setDetailError(err.message || 'Failed to fetch meal details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setAnalyzed(false);
    setSaveSuccess(false);
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await fetch(`${(window as any).configs.apiUrl}/api/meals/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) {
        throw new Error('Failed to analyze meal.');
      }
      const data = await res.json();
      setComponents(data.components || []);
      setAnalyzed(true);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze meal.');
    } finally {
      setLoading(false);
    }
  };

  const handleComponentChange = (idx: number, field: keyof MealComponent, value: string) => {
    setComponents(prev => prev.map((c, i) =>
      i === idx ? { ...c, [field]: field === 'name' ? value : parseFloat(value) || 0 } : c
    ));
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const jwt = localStorage.getItem('jwt');
      const meal_date = new Date().toISOString();
      const res = await fetch(`${(window as any).configs.apiUrl}/api/meals/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ meal_date, description, components }),
      });
      if (!res.ok) {
        throw new Error('Failed to save meal.');
      }
      setSaveSuccess(true);
      setDescription('');
      setComponents([]);
      setAnalyzed(false);
      fetchMeals(); // refresh history
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save meal.');
    } finally {
      setSaveLoading(false);
    }
  };

  const startEdit = () => {
    if (!mealDetail) return;
    setEditDescription(mealDetail.description);
    setEditComponents(mealDetail.components.map(c => ({ ...c })));
    setEditing(true);
    setEditError('');
    setEditSuccess(false);
  };

  const handleEditComponentChange = (idx: number, field: keyof MealComponent, value: string) => {
    setEditComponents(prev => prev.map((c, i) =>
      i === idx ? { ...c, [field]: field === 'name' ? value : parseFloat(value) || 0 } : c
    ));
  };

  const saveEdit = async () => {
    if (!mealDetail) return;
    setEditLoading(true);
    setEditError('');
    setEditSuccess(false);
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await fetch(`${(window as any).configs.apiUrl}/api/meals/${mealDetail.mealId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          meal_date: mealDetail.meal_date,
          description: editDescription,
          components: editComponents,
        }),
      });
      if (!res.ok) throw new Error('Failed to update meal.');
      setEditSuccess(true);
      setEditing(false);
      fetchMealDetail(mealDetail.mealId); // refresh detail
      fetchMeals(); // refresh history
    } catch (err: any) {
      setEditError(err.message || 'Failed to update meal.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!mealDetail) return;
    if (!window.confirm('Are you sure you want to delete this meal?')) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await fetch(`${(window as any).configs.apiUrl}/api/meals/${mealDetail.mealId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete meal.');
      setSelectedMealId(null);
      fetchMeals();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete meal.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Render meal detail view
  const renderMealDetail = () => {
    if (detailLoading) {
      return <div className="text-center text-gray-500 py-8">Loading meal details...</div>;
    }
    if (detailError) {
      return <div className="text-center text-red-500 py-8">{detailError}</div>;
    }
    if (!mealDetail) {
      return null;
    }
    if (editing) {
      return (
        <div className="py-8">
          <button
            className="mb-6 text-orange-600 hover:underline font-semibold"
            onClick={() => setEditing(false)}
            disabled={editLoading}
          >
            ← Cancel Edit
          </button>
          <h2 className="text-2xl font-bold mb-2 text-orange-700">Edit Meal</h2>
          <div className="mb-2 text-gray-700">
            <span className="font-semibold">Date:</span> {new Date(mealDetail.meal_date).toLocaleString()}
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              className="w-full border rounded p-2 mb-2"
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              disabled={editLoading}
            />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-green-700">Components</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            {editComponents.length === 0 && <div className="text-gray-500">No components found.</div>}
            {editComponents.map((c, idx) => (
              <div key={idx} className="flex flex-wrap gap-2 items-center mb-2">
                <input
                  className="border rounded px-2 py-1 w-32"
                  value={c.name}
                  onChange={e => handleEditComponentChange(idx, 'name', e.target.value)}
                  disabled={editLoading}
                />
                <input
                  className="border rounded px-2 py-1 w-20"
                  type="number"
                  value={c.calories}
                  onChange={e => handleEditComponentChange(idx, 'calories', e.target.value)}
                  min={0}
                  step={0.1}
                  placeholder="kcal"
                  disabled={editLoading}
                />
                <span className="text-gray-500">kcal</span>
                <input
                  className="border rounded px-2 py-1 w-16"
                  type="number"
                  value={c.fat_g}
                  onChange={e => handleEditComponentChange(idx, 'fat_g', e.target.value)}
                  min={0}
                  step={0.1}
                  placeholder="fat"
                  disabled={editLoading}
                />
                <span className="text-gray-500">g fat</span>
                <input
                  className="border rounded px-2 py-1 w-16"
                  type="number"
                  value={c.protein_g}
                  onChange={e => handleEditComponentChange(idx, 'protein_g', e.target.value)}
                  min={0}
                  step={0.1}
                  placeholder="protein"
                  disabled={editLoading}
                />
                <span className="text-gray-500">g protein</span>
                <input
                  className="border rounded px-2 py-1 w-16"
                  type="number"
                  value={c.carbs_g}
                  onChange={e => handleEditComponentChange(idx, 'carbs_g', e.target.value)}
                  min={0}
                  step={0.1}
                  placeholder="carbs"
                  disabled={editLoading}
                />
                <span className="text-gray-500">g carbs</span>
              </div>
            ))}
          </div>
          {editError && <div className="text-red-500 mb-2">{editError}</div>}
          {editSuccess && <div className="text-green-600 font-semibold mb-2">Meal updated!</div>}
          <button
            className="bg-green-500 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-green-600 transition disabled:opacity-60 mr-4"
            onClick={saveEdit}
            disabled={editLoading}
          >
            {editLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      );
    }
    return (
      <div className="py-8">
        <button
          className="mb-6 text-orange-600 hover:underline font-semibold"
          onClick={() => setSelectedMealId(null)}
          disabled={deleteLoading}
        >
          ← Back to Meal History
        </button>
        <h2 className="text-2xl font-bold mb-2 text-orange-700">Meal Details</h2>
        <div className="mb-2 text-gray-700">
          <span className="font-semibold">Date:</span> {new Date(mealDetail.meal_date).toLocaleString()}
        </div>
        <div className="mb-4 text-gray-700">
          <span className="font-semibold">Description:</span> {mealDetail.description}
        </div>
        <h3 className="text-lg font-semibold mb-2 text-green-700">Components</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          {mealDetail.components.length === 0 && <div className="text-gray-500">No components found.</div>}
          {mealDetail.components.map((c, idx) => (
            <div key={idx} className="flex flex-wrap gap-2 items-center mb-2">
              <span className="font-semibold text-orange-700">{c.name}</span>
              <span className="text-gray-700">{c.calories} kcal</span>
              <span className="text-gray-500">| {c.fat_g}g fat</span>
              <span className="text-gray-500">| {c.protein_g}g protein</span>
              <span className="text-gray-500">| {c.carbs_g}g carbs</span>
            </div>
          ))}
        </div>
        {deleteError && <div className="text-red-500 mb-2">{deleteError}</div>}
        <div className="flex gap-4 mt-4">
          <button
            className="bg-blue-500 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-600 transition"
            onClick={startEdit}
            disabled={deleteLoading}
          >
            Edit
          </button>
          <button
            className="bg-red-500 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-red-600 transition disabled:opacity-60"
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-green-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar: Meal History */}
        <aside className="w-80 min-w-[16rem] max-w-xs h-[calc(100vh-4rem)] sticky top-0 bg-white/90 border-r border-orange-100 shadow-lg flex flex-col z-10">
          <h2 className="text-xl font-bold mb-4 text-orange-700 px-6 pt-6">Your Meal Log</h2>
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            {historyLoading && <div className="text-center text-gray-500">Loading your meals...</div>}
            {historyError && <div className="text-center text-red-500">{historyError}</div>}
            {!historyLoading && !historyError && meals.length === 0 && (
              <div className="text-center text-gray-500 text-lg">No meals yet. Start by logging your first meal!</div>
            )}
            {!historyLoading && !historyError && meals.length > 0 && (
              <ul className="divide-y divide-orange-100">
                {meals.map(meal => (
                  <li
                    key={meal.mealId}
                    className={`py-4 flex flex-col gap-1 cursor-pointer rounded transition px-2 ${selectedMealId === meal.mealId ? 'bg-orange-100' : 'hover:bg-orange-50'}`}
                    onClick={() => {
                      setSelectedMealId(meal.mealId);
                      fetchMealDetail(meal.mealId);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-orange-700">{new Date(meal.meal_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="text-green-700 font-bold">{meal.total_calories} kcal</span>
                    </div>
                    <div className="text-gray-700 line-clamp-2">{meal.description}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 flex flex-col items-start justify-start p-12">
          {/* If a meal is selected, show detail/edit, else show new meal entry */}
          {selectedMealId ? (
            renderMealDetail()
          ) : (
            <div className="w-full max-w-2xl">
              <h2 className="text-3xl font-bold mb-4 text-orange-700">Log a New Meal</h2>
              <div className="mb-6">
                <label className="block mb-2 text-lg font-medium text-gray-700">Describe what you ate today:</label>
                <textarea
                  className="w-full h-32 p-4 border border-orange-200 rounded-lg bg-yellow-50 font-mono text-base leading-relaxed shadow-inner resize-none notebook-lines"
                  style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 28px, #fde68a 29px)' }}
                  placeholder="E.g. This morning I had oatmeal with berries and a glass of orange juice."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button
                className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-orange-600 transition mb-6 disabled:opacity-60"
                onClick={handleAnalyze}
                disabled={loading || !description.trim()}
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
              {error && <div className="text-red-500 mt-2 mb-4">{error}</div>}
              {saveSuccess && <div className="text-green-600 font-semibold mb-4">Meal saved! 🎉</div>}
              {analyzed && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2 text-green-700">Nutritional Breakdown</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    {components.length === 0 && <div className="text-gray-500">No food items detected.</div>}
                    {components.map((c, idx) => (
                      <div key={idx} className="flex flex-wrap gap-2 items-center mb-2">
                        <input
                          className="border rounded px-2 py-1 w-32"
                          value={c.name}
                          onChange={e => handleComponentChange(idx, 'name', e.target.value)}
                        />
                        <input
                          className="border rounded px-2 py-1 w-20"
                          type="number"
                          value={c.calories}
                          onChange={e => handleComponentChange(idx, 'calories', e.target.value)}
                          min={0}
                          step={0.1}
                          placeholder="kcal"
                        />
                        <span className="text-gray-500">kcal</span>
                        <input
                          className="border rounded px-2 py-1 w-16"
                          type="number"
                          value={c.fat_g}
                          onChange={e => handleComponentChange(idx, 'fat_g', e.target.value)}
                          min={0}
                          step={0.1}
                          placeholder="fat"
                        />
                        <span className="text-gray-500">g fat</span>
                        <input
                          className="border rounded px-2 py-1 w-16"
                          type="number"
                          value={c.protein_g}
                          onChange={e => handleComponentChange(idx, 'protein_g', e.target.value)}
                          min={0}
                          step={0.1}
                          placeholder="protein"
                        />
                        <span className="text-gray-500">g protein</span>
                        <input
                          className="border rounded px-2 py-1 w-16"
                          type="number"
                          value={c.carbs_g}
                          onChange={e => handleComponentChange(idx, 'carbs_g', e.target.value)}
                          min={0}
                          step={0.1}
                          placeholder="carbs"
                        />
                        <span className="text-gray-500">g carbs</span>
                      </div>
                    ))}
                  </div>
                  {saveError && <div className="text-red-500 mb-2">{saveError}</div>}
                  <div className="flex gap-4">
                    <button
                      className="bg-green-500 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-green-600 transition disabled:opacity-60"
                      onClick={handleSave}
                      disabled={saveLoading || components.length === 0}
                    >
                      {saveLoading ? 'Saving...' : 'Save Meal' }
                    </button>
                    <button
                      className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-semibold shadow hover:bg-gray-300 transition"
                      onClick={() => { setAnalyzed(false); setDescription(''); setComponents([]); setSaveError(''); setSaveSuccess(false); }}
                      disabled={saveLoading}
                    >
                      Discard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardPage; 