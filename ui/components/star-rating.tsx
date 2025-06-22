"use client"

import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number // Rating from 0 to 10
  maxRating?: number
  size?: "sm" | "md" | "lg"
  showNumber?: boolean
}

export function StarRating({ rating, maxRating = 10, size = "md", showNumber = true }: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  // Convert rating to 5-star scale for visual representation
  // Rating de 10/10 debe mostrar 5 estrellas completas
  const starRating = (rating / maxRating) * 5
  const fullStars = Math.floor(starRating)
  const hasHalfStar = starRating % 1 >= 0.5

  console.log(
    `StarRating Debug: rating=${rating}, maxRating=${maxRating}, starRating=${starRating}, fullStars=${fullStars}, hasHalfStar=${hasHalfStar}`,
  )

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => {
          const isFilled = index < fullStars
          const isHalf = index === fullStars && hasHalfStar && !isFilled

          return (
            <div key={index} className="relative">
              {/* Estrella base (gris) */}
              <Star className={`${sizeClasses[size]} text-gray-300`} />

              {/* Estrella coloreada (encima) */}
              {(isFilled || isHalf) && (
                <div className="absolute top-0 left-0" style={{ overflow: "hidden", width: isHalf ? "50%" : "100%" }}>
                  <Star className={`${sizeClasses[size]} text-yellow-500`} fill="currentColor" />
                </div>
              )}
            </div>
          )
        })}
      </div>
      {showNumber && (
        <span className={`font-medium text-gray-700 ${textSizeClasses[size]}`}>
          {rating > 0 ? `${rating.toFixed(1)}/10` : "Sin votos"}
        </span>
      )}
    </div>
  )
}
