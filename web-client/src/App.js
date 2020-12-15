import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import { fetchLineLiff } from './actions'
import { RegisterPage } from './pages'

const App = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchLineLiff())
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <Switch>
                <Route path='/register/:groupId' component={RegisterPage} />
            </Switch>
        </>
    )
}

export default App