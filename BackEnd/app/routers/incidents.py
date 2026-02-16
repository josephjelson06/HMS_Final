from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.incident import Incident
from app.schemas.incident import (
    IncidentCreate,
    IncidentResponse,
    IncidentUpdate,
    AdminIncidentResponse,
)

router = APIRouter()


@router.get("/hotels/{hotel_id}/incidents", response_model=List[IncidentResponse])
def get_incidents(hotel_id: int, db: Session = Depends(get_db)):
    return db.query(Incident).filter(Incident.hotel_id == hotel_id).all()


@router.get("/incidents", response_model=List[AdminIncidentResponse])
def get_all_incidents(db: Session = Depends(get_db)):
    incidents = db.query(Incident).all()
    # Enrich with hotel name
    for incident in incidents:
        if incident.hotel:
            incident.hotel_name = incident.hotel.name
    return incidents


@router.post("/hotels/{hotel_id}/incidents", response_model=IncidentResponse)
def create_incident(
    hotel_id: int, incident: IncidentCreate, db: Session = Depends(get_db)
):
    db_incident = Incident(**incident.dict(), hotel_id=hotel_id)
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return db_incident


@router.get(
    "/hotels/{hotel_id}/incidents/{incident_id}", response_model=IncidentResponse
)
def get_incident(hotel_id: int, incident_id: int, db: Session = Depends(get_db)):
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id, Incident.hotel_id == hotel_id)
        .first()
    )
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.put(
    "/hotels/{hotel_id}/incidents/{incident_id}", response_model=IncidentResponse
)
def update_incident(
    hotel_id: int,
    incident_id: int,
    incident_data: IncidentUpdate,
    db: Session = Depends(get_db),
):
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id, Incident.hotel_id == hotel_id)
        .first()
    )
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    update_data = incident_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(incident, key, value)

    db.commit()
    db.refresh(incident)
    return incident


@router.delete(
    "/hotels/{hotel_id}/incidents/{incident_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_incident(hotel_id: int, incident_id: int, db: Session = Depends(get_db)):
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id, Incident.hotel_id == hotel_id)
        .first()
    )
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    db.delete(incident)
    db.commit()
    return None
