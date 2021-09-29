import './App.css';
import React, {useState, useEffect} from 'react';
import Note from './components/Note';
import noteService from './services/note'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TextField from '@material-ui/core/TextField';
import moment from 'moment'
import Notification from './components/Notification';
import LoginService from './services/login'

const App = (props) => {
    const [note, setNote] = useState([])
    const [newNote, setNewNote] = useState('')
    const [newDay, setNewDay] = useState('')
    const [newOur, setNewOur] = useState('')
    const [showAll, setShowAll] = useState(true)
    const [errorMessage, setErrorMessage] = useState(null)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [user, setUser] = useState(null)

    const handleLogin = async (event) => {
        event.preventDefault()

        try {
            const user = await LoginService.login({
                username, password,
            })
            localStorage.setItem(
                'loggedNoteAppUser', JSON.stringify(user)
            )
            setTimeout(()=>{
                localStorage.removeItem('loggedNoteAppUser')
                setUser(null)
            },1000*60*30)
            noteService.setToken(user.token)
            setUser(user)
            setUsername('')
            setPassword('')
        } catch (exception) {
            setErrorMessage('Wrong credentials')
            setTimeout(() => {
                setErrorMessage(null)
            }, 5000)
        }
    }

    useEffect(() => {
        noteService
            .getAll()
            .then(res => {
                setNote(res.data.sort((a, b) => b.giorno > a.giorno ? -1 : 1))

            })
    }, [])

    useEffect(() => {
        const loggedUserJSON = localStorage.getItem('loggedNoteAppUser')
        if (loggedUserJSON) {
            const user = JSON.parse(loggedUserJSON)
            setUser(user)
            noteService.setToken(user.token)
        }
    }, [])

    const addNote = (e) => {
        e.preventDefault()
        const noteObj = {
            tema: newNote,
            giorno: newDay,
            ora: newOur,
            data: new Date().toISOString(),
            important: Math.random() < 0.5,
            id: note.lenght + 1
        }
        noteService
            .create(noteObj)
            .then(res => {
                setNote(note.concat(res.data).sort((a, b) => new Date(a.giorno) - new Date(b.giorno)))
                setNewNote('')
                setNewDay('')
                setNewOur('')
            })
    }
    const toggleImportanceOf = id => {
        const nota = note.find(n => n.id === id)
        const changedNote = { ...nota, important: !nota.important }
        noteService.update(id, changedNote).then(res => {
            setNote(note.map(nota => nota.id !== id ? nota : res.data))
        })
            .catch(error => {
                setErrorMessage(
                    `La nota '${nota.tema}' è stata rimossa dalla lista`
                )
                setTimeout(() => {
                    setErrorMessage(null)
                }, 5000)

            })
    }
    const deleteNoteOf = (id, tema) => {
        const r = window.confirm(`Sicuro di voler cancellare la nota  ${tema} ?`)
        if (r === false) {
            return
        } else {
            note.filter(n => n.id === id)
            noteService
                .elimina(id)
                .then(() => {
                    setNote(note.filter(nota => nota.id !== id))
                })
        }
    }

    const handleNoteChange = (e) => {
        setNewNote(e.target.value)

    }
    const handleDayChange = (date) => {
        setNewDay(date)

    }

    const handleOurChange = (e) => {
        setNewOur(e.target.value)
    }


    const noteToShow = showAll
        ? note
        : note.filter(nota => nota.important)

    const loginForm = () => (
        <div id="login-page" className="row">
            <div className="col s12 z-depth-6 card-panel">
                <form className="login-form" onSubmit={handleLogin}>
                    <div className="row">
                    </div>
                    <div className="row">
                        <div className="input-field col s12">
                            <i className="material-icons prefix">account_box</i>
                            <input
                                className="validate"
                                id="user"
                                type="text"
                                name='Username'
                                value={username}
                                onChange={({target}) => setUsername(target.value)}
                            />
                            <label htmlFor="user" data-error="wrong" data-success="right">User</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="input-field col s12">
                            <i className="material-icons prefix">lock_outline</i>
                            <input id="password"
                                   type="password"
                                   value={password}
                                   name='Password'
                                   onChange={({target}) => setPassword(target.value)}
                            />
                            <label htmlFor="password">Password</label>
                        </div>
                    </div>
                    <div className="row">
                    </div>
                    <div className="row">
                        <div className="input-field col s12">
                            <button type="submit" className="btn waves-effect waves-light col s12">Login</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
    const noteForm = () => (
        <div className="row">
            <form onSubmit={addNote} className='col s12'>
                <div className="row">
                    <div className="input-field col s6">
                        <i className="material-icons prefix">chat</i>
                        <input
                            id="icon_prefix"
                            type="text"
                            className="validate"
                            name='tema'
                            onChange={handleNoteChange}
                            value={newNote}
                            required
                        />
                        <label htmlFor="icon_prefix">Aggiungi nota...</label>
                    </div>
                    <div className="col s3">
                        <div style={{marginTop: '16px'}}>
                            <i className="material-icons prefix" style={{marginRight: '5px'}}>date_range</i>
                            <DatePicker
                                autoComplete='off'
                                selected={newDay}
                                onChange={handleDayChange}
                                id="icon_prefix"
                                className="validate"
                                dateFormat='dd/MM/yyyy'
                                style={{marginLeft: '5px'}}
                                minDate={moment().toDate()}
                                required
                                placeholderText='Data...'
                            />
                        </div>

                    </div>
                    <div className="col s3">
                        <TextField
                            onChange={handleOurChange}
                            value={newOur}
                            required
                            id="time"
                            label="Ora..."
                            type="time"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                step: 300, // 5 min
                            }}
                        />
                    </div>
                </div>
                <button className='btn-floating  waves-effect waves-light green' type='submit'><i
                    className="material-icons">add_to_photos</i></button>
            </form>
        </div>
    )
    const noteList = () => (
        <>
            <button className='waves-effect waves-light btn-small' onClick={() => setShowAll(!showAll)}>
                show {showAll ? 'important' : 'all'}
            </button>
            <ul className='collection'>
                {noteToShow.map(nota =>
                    <Note
                        key={nota.id}
                        nota={nota}
                        toggleImportance={() => toggleImportanceOf(nota.id)}
                        deleteNote={() => deleteNoteOf(nota.id, nota.tema)}
                    />
                )}
            </ul>
        </>
    )

    const logout = () => {
        localStorage.removeItem('loggedNoteAppUser')
        setUser(null)
    }
    return (

        <div className="container">
            <h1>Note</h1>
            <Notification message={errorMessage}/>
            {user === null ?
                loginForm() :
                <div>
                    <p><i className="small material-icons">account_circle</i> Ciao <span
                        style={{'fontWeight': 'bolder', 'textTransform': 'uppercase'}}>{user.name}</span> <a
                        className="waves-effect waves-light btn-small" onClick={logout}
                        style={{'cursor': 'pointer', 'marginLeft': '5px'}}>Logout <i
                        className="small material-icons">lock_outline</i></a></p>
                    {noteForm()}
                    {noteList()}
                </div>
            }

        </div>
    );
}

export default App;
