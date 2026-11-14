package com.railtrack.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import com.railtrack.entity.RailTrackEnums.TrainType;
import com.railtrack.entity.Train;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TrainRepository extends JpaRepository<Train, String> {

    @EntityGraph(attributePaths = {
            "origin", "destination", "currentStation", "nextStation", "stops", "stops.station"
    })
    List<Train> findAllByOrderByNumberAsc();

    @EntityGraph(attributePaths = {
            "origin", "destination", "currentStation", "nextStation", "stops", "stops.station"
    })
    Optional<Train> findExpandedById(String id);

    @EntityGraph(attributePaths = {
            "origin", "destination", "currentStation", "nextStation", "stops", "stops.station"
    })
    @Query("""
            select distinct train
            from Train train
            left join train.origin origin
            left join train.destination destination
            left join train.stops stop
            left join stop.station stopStation
            where lower(train.number) like lower(concat('%', :term, '%'))
               or lower(train.name) like lower(concat('%', :term, '%'))
               or lower(origin.name) like lower(concat('%', :term, '%'))
               or lower(origin.city) like lower(concat('%', :term, '%'))
               or lower(origin.code) like lower(concat('%', :term, '%'))
               or lower(destination.name) like lower(concat('%', :term, '%'))
               or lower(destination.city) like lower(concat('%', :term, '%'))
               or lower(destination.code) like lower(concat('%', :term, '%'))
               or lower(stopStation.name) like lower(concat('%', :term, '%'))
               or lower(stopStation.city) like lower(concat('%', :term, '%'))
               or lower(stopStation.code) like lower(concat('%', :term, '%'))
            order by train.number
            """)
    List<Train> searchExpandedByTerm(@Param("term") String term);

    @EntityGraph(attributePaths = {
            "origin", "destination", "currentStation", "nextStation", "stops", "stops.station"
    })
    List<Train> findByTypeIn(Collection<TrainType> types);
}
