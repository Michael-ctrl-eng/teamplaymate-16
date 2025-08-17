import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useLanguage } from '../contexts/LanguageContext';
import { Save, X, Plus, Edit, Trash2 } from 'lucide-react';

interface MatchNote {
  id: string;
  minute: number;
  title: string;
  content: string;
  category: 'tactical' | 'performance' | 'injury' | 'general';
  timestamp: Date;
}

interface MatchNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  notes: MatchNote[];
  onSaveNotes: (notes: MatchNote[]) => void;
}

export const MatchNotesModal: React.FC<MatchNotesModalProps> = ({
  isOpen,
  onClose,
  matchId,
  notes,
  onSaveNotes
}) => {
  const { t } = useLanguage();
  const [localNotes, setLocalNotes] = useState<MatchNote[]>(notes);
  const [newNote, setNewNote] = useState({
    minute: 0,
    title: '',
    content: '',
    category: 'general' as const
  });
  const [editingNote, setEditingNote] = useState<string | null>(null);

  const categories = [
    { value: 'tactical', label: t('match.notes.tactical'), color: 'bg-blue-100 text-blue-800' },
    { value: 'performance', label: t('match.notes.performance'), color: 'bg-green-100 text-green-800' },
    { value: 'injury', label: t('match.notes.injury'), color: 'bg-red-100 text-red-800' },
    { value: 'general', label: t('match.notes.general'), color: 'bg-gray-100 text-gray-800' }
  ];

  const addNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    const note: MatchNote = {
      id: Date.now().toString(),
      minute: newNote.minute,
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      timestamp: new Date()
    };

    setLocalNotes(prev => [...prev, note].sort((a, b) => a.minute - b.minute));
    setNewNote({ minute: 0, title: '', content: '', category: 'general' });
  };

  const deleteNote = (noteId: string) => {
    setLocalNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const saveNotes = () => {
    onSaveNotes(localNotes);
    onClose();
  };

  const getCategoryStyle = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {t('match.notes.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-6 p-6">
          {/* Add New Note */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-semibold mb-4">{t('match.notes.add.new')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('match.notes.minute')}</label>
                <Input
                  type="number"
                  value={newNote.minute}
                  onChange={(e) => setNewNote(prev => ({ ...prev, minute: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  min="0"
                  max="120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('match.notes.category')}</label>
                <select
                  value={newNote.category}
                  onChange={(e) => setNewNote(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">{t('match.notes.title')}</label>
                <Input
                  value={newNote.title}
                  onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t('match.notes.title.placeholder')}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">{t('match.notes.content')}</label>
              <Textarea
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                placeholder={t('match.notes.content.placeholder')}
                rows={3}
              />
            </div>
            <Button onClick={addNote} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              {t('match.notes.add')}
            </Button>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto">
            <h3 className="font-semibold mb-4">{t('match.notes.list')} ({localNotes.length})</h3>
            {localNotes.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {t('match.notes.empty')}
              </div>
            ) : (
              <div className="space-y-3">
                {localNotes.map((note) => (
                  <div key={note.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {note.minute}'
                        </div>
                        <div>
                          <h4 className="font-semibold">{note.title}</h4>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryStyle(note.category)}`}>
                            {categories.find(c => c.value === note.category)?.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => setEditingNote(note.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => deleteNote(note.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {note.timestamp.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 p-6 border-t">
          <Button onClick={onClose} variant="outline">
            {t('match.notes.cancel')}
          </Button>
          <Button onClick={saveNotes} className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            {t('match.notes.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};