import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function OngoingVotes() {
    const [votes, setVotes] = useState([]);
    const navigate = useNavigate();

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const accessToken = storedUser?.access;
    const currentUserRole = storedUser?.user?.role;

    const fetchVotes = useCallback(() => {
        if (!accessToken) {
            navigate("/login");
            return;
        }

        fetch("http://localhost:8000/api/moderation/votes/active/", { 
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        })
        .then(res => {
            if (res.status === 401) {
                alert("401 Unauthorized");
                localStorage.removeItem("user");
                navigate("/login");
            }
            return res.json();
        })
        .then(data => {
            setVotes(data);
        })
    }, [accessToken, navigate]);

    useEffect(() => {
        fetchVotes();
    }, [fetchVotes]);

    const handleVote = (voteId, voteType) => {
        if (!accessToken) {
            alert("401 Unauthorized");
            navigate("/login");
            return;
        }

        fetch(`http://localhost:8000/api/moderation/votes/${voteId}/vote/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({choice: voteType}),
        })
        .then(res => {
            if (res.status === 401) {
                alert("401 Unauthorized");
                localStorage.removeItem("user");
                navigate("/login");
            }
            return res.json(); 
        })
        .then(data => {
            console.log(data)
            alert("Vote submitted successfully!");
            fetchVotes(); 
        })
    };

    let content;
    
    if (currentUserRole === 'simple') {
        content = (
            <div className="alert alert-primary p-3">
                <h4 className="alert-heading">Your current role: {currentUserRole.toUpperCase()}</h4>
                <p className="mb-0">
                    There will be something
                </p>
            </div>
        );
    } else if (votes.length === 0) {
        content = (
            <div className="alert alert-success p-3">
                There is no any votes for now. Come again later
            </div>
        );
    } else {
        content = (
            <div className="row g-4 justify-content-center"> 
                {votes.map((vote) => (
                    <div key={vote.id} className="col-121 col-sm-61 col-lg-41"> 
                        <div className="card shadow-sm"> 
                            <div className="card-body">
                                <h5 className="card-title text-primary">Vote for {vote.nominated_user_username}</h5>
                                <h6 className="card-subtitle mb-2 text-primary">
                                    Promoting to {vote.promotion_role?.toUpperCase()}
                                </h6>
                                <p className="card-text small">
                                    Status: <span className="badge bg-warning text-dark">{vote.status?.toUpperCase() || 'ACTIVE'}</span>
                                </p>
                                <p className="card-text small">
                                    Votes: {vote.for_amount} YES / {vote.against_amount} NO (Progress: {vote.progress}%)
                                </p>
                                <button 
                                    className="btn btn-sm btn-outline-success me-2"
                                    onClick={() => handleVote(vote.id, 'for')}
                                >
                                    YES
                                </button>
                                <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleVote(vote.id, 'against')}
                                >
                                    NO
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h1 className="mb-4 text-center text-secondary">Ongoing Promotion Votes</h1>
            <div className="auto-height-override">
                {content}
            </div>
        </div>
    );
}