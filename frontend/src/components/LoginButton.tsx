function LoginButton(props: {
    logged: Boolean
    header: string
    user: string
    signinFlow: any
    signoutFlow: any
    iconSource: string
}) {
    return (
        <div className="near-user">
            <div
                className="dropdown dropdown-right"
                tabIndex={0}
                onClick={() =>
                    props.logged ? console.log('No action') : props.signinFlow()
                }
            >
                <div className="btn">
                    <img
                        className="btn-icon"
                        src={props.iconSource}
                        alt={props.header}
                        height="40"
                    />
                    <span className="text-ellipsis">
                        {props.logged ? props.user : 'Log In'}
                    </span>
                </div>
                {props.logged && (
                    <ul className="menu">
                        <li className="menu-item">
                            <a href="#" onClick={props.signoutFlow}>
                                Log Out
                            </a>
                        </li>
                    </ul>
                )}
            </div>
        </div>
    )
}

export default LoginButton
