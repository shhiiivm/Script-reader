import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Play, Trash2, Edit2, Save } from 'lucide-react';

export default function Popup() {
  const [scripts, setScripts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    setLoading(true);
    try {
      const data = await api.getScripts();
      setScripts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title || !content) return;
    setLoading(true);
    try {
      if (editingId) {
        await api.updateScript(editingId, { title, content });
      } else {
        await api.createScript({ title, content });
      }
      setEditingId(null);
      setTitle('');
      setContent('');
      loadScripts();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (script: any) => {
    setEditingId(script.id);
    setTitle(script.title);
    setContent(script.content);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete script?')) return;
    try {
      await api.deleteScript(id);
      loadScripts();
    } catch (e) {
      console.error(e);
    }
  };

  const startTeleprompter = (script: any) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab.id) {
        chrome.tabs.sendMessage(activeTab.id, {
          action: 'TOGGLE_TELEPROMPTER',
          script: script
        });
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">PromptCam</h1>
        <button 
          onClick={() => { setEditingId(null); setTitle(''); setContent(''); }}
          className="bg-blue-500 hover:bg-blue-400 p-2 rounded-full transition"
          title="New Script"
        >
          <Plus size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {editingId !== null || title || content ? (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Script Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <textarea
              placeholder="Paste your script here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
            <div className="flex gap-2">
              <button 
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Save size={18} /> {loading ? 'Saving...' : 'Save Script'}
              </button>
              <button 
                onClick={() => { setEditingId(null); setTitle(''); setContent(''); }}
                className="px-4 bg-gray-200 text-gray-700 py-2 rounded font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-gray-500 py-4">Loading scripts...</p>
            ) : scripts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No scripts found. Create one!</p>
            ) : (
              scripts.map((script) => (
                <div key={script.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex-1 truncate pr-2">
                    <h3 className="font-semibold truncate">{script.title}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startTeleprompter(script)} className="p-2 text-green-600 hover:bg-green-50 rounded transition" title="Start Teleprompter">
                      <Play size={18} />
                    </button>
                    <button onClick={() => handleEdit(script)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(script.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
