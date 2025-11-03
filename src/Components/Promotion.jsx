import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Promotion() {
    
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const accessToken = storedUser?.access || null; 

    const initialRole = storedUser?.user?.role
    const currentUserId = storedUser?.user?.id

    const [currentUserRole, setCurrentUserRole] = useState(initialRole);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!accessToken) {
            navigate("/login");
        }
    }, [accessToken, navigate]);

    const handleApplyPromotion = (targetRole) => {
        if (!targetRole || !currentUserId) {
            alert("Application impossible: Target role or User ID is undefined.");
            return;
        }

        const promotionData = {
            nominated_user: `${currentUserId}`,
            promotion_role: targetRole,
            vote_type: "promotion",
            roles_allowed_vote: [targetRole],
        };
        
            fetch('http://localhost:8000/api/moderation/votes/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`, 
                },
                body: JSON.stringify(promotionData), 
            })
            .then(res => {
            
            if (!res.ok && res.status !== 202) {
                
                if (res.status === 401) {
                    alert("401 Unauthorized");
                    navigate('/login');
                }
                
                return res.json()
            }
            return res.json();
        })
        .then(data => {
            const message = data.message || `Vote created successfully! ID: ${data.id}`;
            alert(`✅ ${message}`);
        })
    };

    let promotionContent = null; 

     if (currentUserRole === 'architecture') {
        promotionContent = (
            <div className="text-center">
                <h3 className="text-success">Your current role: ARCHITECT</h3>
                <h1 className="text-success">Congratulations! You have reached the highest level!</h1>
            </div>
        );
    } else if (currentUserRole === 'simple') {
        promotionContent = (
            <div className="text-center">
                <h3 className="text-secondary">Your current role: SIMPLE</h3>
                <h1 className="text-primary">Promotion to SILVER</h1>
                <button 
                    className="btn btn-primary mt-3" 
                    onClick={() => handleApplyPromotion('silver')}
                    disabled={loading}
                >
                    Apply for Silver
                </button>
            </div>
        );
    } else if (currentUserRole === 'silver') {
        promotionContent = (
            <div className="text-center">
                <h3 className="text-secondary">Your current role: SILVER</h3>
                <h1 className="text-warning">Promotion to GOLDEN</h1>
                <button 
                    className="btn btn-warning mt-3" 
                    onClick={() => handleApplyPromotion('gold')}
                    disabled={loading}
                >
                    Apply for Golden
                </button>
            </div>
        );
    } else if (currentUserRole === 'gold') {
        promotionContent = (
            <div className="text-center">
                <h3 className="text-secondary">Your current role: GOLDEN</h3>
                <h1 className="text-danger">Promotion to ARCHITECT</h1>
                <button 
                    className="btn btn-danger mt-3" 
                    onClick={() => handleApplyPromotion('architecture')}
                    disabled={loading}
                >
                    Apply for Architect
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <div className="card p-4 shadow-sm" style={{ maxWidth: '600px', margin: 'auto' }}>
                <h2 className="text-center mb-4 text-primary">Role Management Center</h2>
                {promotionContent}
            </div>
        </div>
    );
}